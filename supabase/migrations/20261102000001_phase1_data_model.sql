-- =============================================================================
-- Migration: Phase 1 Data Model (Fase 1)
-- Description:
--   1. profiles.role (admin / employee / customer) replacing ADMIN_EMAILS & admin_users
--   2. products with active boolean (logical soft-delete)
--   3. stock_movements table and automated inventory change logging trigger
--   4. order_items capturing product_name snapshot at purchase time
--   5. settings.bank_info for bank transfer details editable from admin
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. profiles.role: admin / employee / customer
-- -----------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'employee', 'customer'));
    END IF;
END $$;

-- Índice para búsquedas rápidas por rol
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Migrar correos de admin_users o admins conocidos a rol 'admin'
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'admin_users') THEN
        UPDATE public.profiles p
        SET role = 'admin'
        FROM public.admin_users a
        WHERE p.email = a.email;
    END IF;

    UPDATE public.profiles
    SET role = 'admin'
    WHERE email IN ('facundo@pfstudio.com', 'admin@pfstudio.com.ar');
END $$;

-- Actualizar función is_admin() para consultar profiles.role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'employee')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Función auxiliar para operaciones exclusivas de administrador total
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Actualizar trigger de nuevos usuarios
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
    VALUES (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
        coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', ''),
        'customer'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = coalesce(EXCLUDED.full_name, public.profiles.full_name),
        updated_at = timezone('utc'::text, now());
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Actualizar políticas RLS de profiles: solo admin puede cambiar roles de usuario
DROP POLICY IF EXISTS "Profiles are updatable by owner or admin" ON public.profiles;
CREATE POLICY "Profiles are updatable by owner or admin" ON public.profiles 
    FOR UPDATE 
    USING (auth.uid() = id OR public.is_admin()) 
    WITH CHECK (
        (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()))
        OR public.is_super_admin()
    );

-- -----------------------------------------------------------------------------
-- 2. products.active: Baja lógica (nunca borrar físicamente)
-- -----------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'active'
    ) THEN
        ALTER TABLE public.products 
        ADD COLUMN active BOOLEAN NOT NULL DEFAULT true;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(active);

-- -----------------------------------------------------------------------------
-- 3. stock_movements: Auditoría e historial completo de inventario
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.stock_movements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    product_stock_id UUID REFERENCES public.product_stock(id) ON DELETE SET NULL,
    size TEXT,
    quantity_change INTEGER NOT NULL,
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    reason TEXT NOT NULL CHECK (reason IN ('sale', 'restock', 'adjustment', 'cancellation', 'return', 'manual')),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON public.stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_order_id ON public.stock_movements(order_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON public.stock_movements(created_at DESC);

-- Trigger automático para registrar cada cambio de stock en product_stock
CREATE OR REPLACE FUNCTION public.log_stock_movement_trigger()
RETURNS trigger AS $$
DECLARE
    v_reason TEXT;
    v_user_id UUID;
    v_order_id UUID;
BEGIN
    IF OLD.stock_quantity IS DISTINCT FROM NEW.stock_quantity THEN
        v_reason := current_setting('pf.stock_reason', true);
        IF v_reason IS NULL OR v_reason = '' THEN
            IF NEW.stock_quantity > OLD.stock_quantity THEN
                v_reason := 'restock';
            ELSE
                v_reason := 'adjustment';
            END IF;
        END IF;

        BEGIN
            v_user_id := auth.uid();
        EXCEPTION WHEN OTHERS THEN
            v_user_id := NULL;
        END;

        BEGIN
            v_order_id := NULLIF(current_setting('pf.stock_order_id', true), '')::uuid;
        EXCEPTION WHEN OTHERS THEN
            v_order_id := NULL;
        END;

        INSERT INTO public.stock_movements (
            product_id,
            product_stock_id,
            size,
            quantity_change,
            previous_stock,
            new_stock,
            reason,
            user_id,
            order_id
        ) VALUES (
            NEW.product_id,
            NEW.id,
            NEW.size,
            NEW.stock_quantity - OLD.stock_quantity,
            OLD.stock_quantity,
            NEW.stock_quantity,
            v_reason,
            v_user_id,
            v_order_id
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS tr_log_stock_movement ON public.product_stock;
CREATE TRIGGER tr_log_stock_movement
    AFTER UPDATE ON public.product_stock
    FOR EACH ROW
    EXECUTE FUNCTION public.log_stock_movement_trigger();

-- Actualizar decrement_stock para soportar orden y motivo
CREATE OR REPLACE FUNCTION public.decrement_stock(
    p_id uuid, 
    p_size text, 
    p_qty int, 
    p_order_id uuid DEFAULT NULL, 
    p_reason text DEFAULT 'sale'
)
RETURNS void AS $$
BEGIN
    -- Establecer contexto para el trigger
    PERFORM set_config('pf.stock_reason', coalesce(p_reason, 'sale'), true);
    IF p_order_id IS NOT NULL THEN
        PERFORM set_config('pf.stock_order_id', p_order_id::text, true);
    END IF;

    -- 1. Descontar del stock específico de la talla (product_stock)
    UPDATE public.product_stock
    SET stock_quantity = stock_quantity - p_qty,
        updated_at = timezone('utc'::text, now())
    WHERE product_id = p_id AND size = p_size AND stock_quantity >= p_qty;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'INSUFFICIENT_STOCK: No hay suficiente stock para el producto % talle %', p_id, p_size;
    END IF;

    -- 2. Descontar del stock consolidado (products)
    UPDATE public.products
    SET stock = stock - p_qty,
        updated_at = timezone('utc'::text, now())
    WHERE id = p_id AND stock >= p_qty;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'INSUFFICIENT_STOCK: No hay suficiente stock total para el producto %', p_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.decrement_stock(uuid, text, int, uuid, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.decrement_stock(uuid, text, int, uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.decrement_stock(uuid, text, int, uuid, text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_stock(uuid, text, int, uuid, text) TO service_role;

-- RLS para stock_movements
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view stock movements" ON public.stock_movements;
CREATE POLICY "Admins can view stock movements" ON public.stock_movements 
    FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins or service can insert stock movements" ON public.stock_movements;
CREATE POLICY "Admins or service can insert stock movements" ON public.stock_movements 
    FOR INSERT WITH CHECK (public.is_admin());

-- -----------------------------------------------------------------------------
-- 4. order_items: Copia histórica inmutable de product_name
-- -----------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'order_items' AND column_name = 'product_name'
    ) THEN
        ALTER TABLE public.order_items 
        ADD COLUMN product_name TEXT NOT NULL DEFAULT '';
    END IF;
END $$;

-- Rellenar nombres históricos en items existentes que carezcan de él
UPDATE public.order_items oi
SET product_name = coalesce(p.name, 'Producto')
FROM public.products p
WHERE oi.product_id = p.id AND (oi.product_name IS NULL OR oi.product_name = '');

-- -----------------------------------------------------------------------------
-- 5. settings.bank_info: Datos de transferencia bancaria
-- -----------------------------------------------------------------------------
INSERT INTO public.settings (key, value)
VALUES (
    'bank_info',
    '{
        "bank": "Naranja X",
        "holder": "Paula Alvarenga",
        "cbu": "4530000800010655590139",
        "alias": "PFSTUDIO.VENTAS",
        "cuit": "27-44685115-8"
    }'::jsonb
)
ON CONFLICT (key) DO NOTHING;

