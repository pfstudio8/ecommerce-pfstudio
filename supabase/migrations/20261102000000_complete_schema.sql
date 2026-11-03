-- =============================================================================
-- Migration: Complete Schema & RLS Security Policies
-- Description: Sets up the full database schema for PF Studio E-Commerce,
--              including products, product_stock, profiles (with roles),
--              stock_movements, order_history, addresses, favorites, reviews,
--              orders, messages, and settings.
--              Enforces strict RLS and secures atomic functions (decrement_stock).
-- =============================================================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. Tabla: profiles (Perfiles vinculados a auth.users con Roles)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'employee', 'customer')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Función de verificación de admin/empleado (SECURITY DEFINER con search_path sanitizado)
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

-- Función exclusiva para super admin (cambio de roles, configuraciones críticas)
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

-- Trigger para sincronizar auth.users -> public.profiles
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 2. Tabla: categories (Categorías de Productos)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Categorías iniciales
INSERT INTO public.categories (name, description)
VALUES 
    ('Clásicas', 'Remeras de corte tradicional'),
    ('Boxy Fit', 'Remeras cortas y anchas'),
    ('Oversize', 'Remeras sueltas y largas'),
    ('Gorras', 'Gorras y viseras exclusivas'),
    ('Botineros', 'Botineros y bolsos deportivos'),
    ('Llaveros', 'Llaveros oficiales y complementarios'),
    ('Vasos', 'Vasos y tazas personalizadas'),
    ('Camisetas', 'Camisetas de fútbol y de colección'),
    ('Tazas', 'Tazas personalizadas y de cerámica'),
    ('Encendedores', 'Encendedores de colección y utilidades'),
    ('Accesorios', 'Otros accesorios y complementos')
ON CONFLICT (name) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 3. Tabla: products (Catálogo de Productos con Baja Lógica 'active')
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL CHECK (price >= 0),
    description TEXT,
    category TEXT,
    department TEXT DEFAULT 'Hombres',
    image_url TEXT,
    hover_image_url TEXT,
    images TEXT[] DEFAULT '{}',
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    "isNew" BOOLEAN DEFAULT false,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(active);

-- -----------------------------------------------------------------------------
-- 4. Tabla: product_stock (Stock por Talle/Variante)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_stock (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    size TEXT NOT NULL,
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    sku TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_product_size UNIQUE (product_id, size)
);

CREATE INDEX IF NOT EXISTS idx_product_stock_product_id ON public.product_stock(product_id);

-- -----------------------------------------------------------------------------
-- 5. Tabla: stock_movements (Auditoría de Cambios de Inventario)
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

-- Trigger para registrar automáticamente cada cambio en product_stock
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

-- -----------------------------------------------------------------------------
-- 6. Tabla: addresses (Direcciones de Envío del Usuario)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    street TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.addresses(user_id);

-- -----------------------------------------------------------------------------
-- 7. Tabla: favorites (Productos Favoritos del Usuario)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_user_favorite UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);

-- -----------------------------------------------------------------------------
-- 8. Tabla: orders (Pedidos)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    total_amount NUMERIC NOT NULL CHECK (total_amount >= 0),
    payment_method TEXT,
    payment_id TEXT UNIQUE,
    shipping_address TEXT,
    tracking_number TEXT,
    carrier TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);

-- -----------------------------------------------------------------------------
-- 9. Tabla: order_items (Artículos del Pedido con Copia Inmutable de Nombre y Precio)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL DEFAULT '',
    size TEXT,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    price_at_purchase NUMERIC NOT NULL CHECK (price_at_purchase >= 0),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- -----------------------------------------------------------------------------
-- 10. Tabla: order_history (Historial de Auditoría de Pedidos)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_order_history_order_id ON public.order_history(order_id);

-- -----------------------------------------------------------------------------
-- 11. Tabla: reviews (Reseñas de Productos)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_user_product_review UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);

-- -----------------------------------------------------------------------------
-- 12. Tabla: messages (Mensajes de Contacto)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- -----------------------------------------------------------------------------
-- 13. Tabla: settings (Configuraciones de la Tienda y Datos Bancarios)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

INSERT INTO public.settings (key, value)
VALUES 
    ('store_info', '{"whatsapp": "5491100000000", "email": "contacto@pfstudio.com", "instagram": "@pfstudio"}'::jsonb),
    ('bank_info', '{"bank": "Naranja X", "holder": "Paula Alvarenga", "cbu": "4530000800010655590139", "alias": "PFSTUDIO.VENTAS", "cuit": "27-44685115-8"}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 14. Función Atómica: decrement_stock (Seguridad Reforzada)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.decrement_stock(
    p_id uuid, 
    p_size text, 
    p_qty int, 
    p_order_id uuid DEFAULT NULL, 
    p_reason text DEFAULT 'sale'
)
RETURNS void AS $$
BEGIN
    -- Establecer contexto para el trigger de movimientos de stock
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

-- Revocación CRÍTICA: Solo invocable por service_role
REVOKE EXECUTE ON FUNCTION public.decrement_stock(uuid, text, int, uuid, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.decrement_stock(uuid, text, int, uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.decrement_stock(uuid, text, int, uuid, text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_stock(uuid, text, int, uuid, text) TO service_role;

-- -----------------------------------------------------------------------------
-- 15. Vista Consolidada: customer_profiles
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.customer_profiles AS
WITH order_stats AS (
    SELECT 
        customer_email,
        count(id) as total_orders,
        coalesce(sum(total_amount), 0) as total_spent,
        min(created_at) as first_seen,
        max(created_at) as last_seen
    FROM public.orders
    GROUP BY customer_email
)
SELECT 
    p.id,
    coalesce(p.email, o.customer_email) as email,
    p.full_name,
    p.role,
    coalesce(o.total_orders, 0) as total_orders,
    coalesce(o.total_spent, 0) as total_spent,
    coalesce(o.first_seen, p.created_at) as first_seen,
    coalesce(o.last_seen, p.created_at) as last_seen
FROM public.profiles p
FULL OUTER JOIN order_stats o ON p.email = o.customer_email;

GRANT SELECT ON public.customer_profiles TO service_role;

-- =============================================================================
-- POLÍTICAS DE SEGURIDAD (Row Level Security - RLS)
-- =============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Profiles are readable by owner or admin" ON public.profiles 
    FOR SELECT USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "Profiles are insertable by owner or service" ON public.profiles 
    FOR INSERT WITH CHECK (auth.uid() = id OR public.is_admin());
CREATE POLICY "Profiles are updatable by owner or admin" ON public.profiles 
    FOR UPDATE USING (auth.uid() = id OR public.is_admin()) 
    WITH CHECK ((auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())) OR public.is_super_admin());
CREATE POLICY "Profiles are deletable by admin" ON public.profiles 
    FOR DELETE USING (public.is_super_admin());

-- Categories
CREATE POLICY "Allow public read categories" ON public.categories 
    FOR SELECT USING (true);
CREATE POLICY "Allow admin manage categories" ON public.categories 
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Products
CREATE POLICY "Allow public read products" ON public.products 
    FOR SELECT USING (true);
CREATE POLICY "Allow admin manage products" ON public.products 
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Product Stock
CREATE POLICY "Allow public read product_stock" ON public.product_stock 
    FOR SELECT USING (true);
CREATE POLICY "Allow admin manage product_stock" ON public.product_stock 
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Stock Movements
CREATE POLICY "Admins can view stock movements" ON public.stock_movements 
    FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins or service can insert stock movements" ON public.stock_movements 
    FOR INSERT WITH CHECK (public.is_admin());

-- Addresses
CREATE POLICY "Users can read own addresses or admin" ON public.addresses 
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users can insert own addresses" ON public.addresses 
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own addresses" ON public.addresses 
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own addresses or admin" ON public.addresses 
    FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- Favorites
CREATE POLICY "Users can read own favorites" ON public.favorites 
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own favorites" ON public.favorites 
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorites" ON public.favorites 
    FOR DELETE USING (auth.uid() = user_id);

-- Orders
CREATE POLICY "Enable read for owners or admins" ON public.orders 
    FOR SELECT USING (
        coalesce(auth.jwt() ->> 'email', '') = customer_email 
        OR auth.uid() = user_id 
        OR public.is_admin()
    );
CREATE POLICY "Enable user self cancel pending orders" ON public.orders 
    FOR UPDATE USING (
        (auth.uid() = user_id OR coalesce(auth.jwt() ->> 'email', '') = customer_email)
        AND status = 'pending'
    )
    WITH CHECK (
        status = 'cancelled'
    );
CREATE POLICY "Enable admin manage orders" ON public.orders 
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Order Items
CREATE POLICY "Enable read for owners or admins on order_items" ON public.order_items 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = order_items.order_id 
            AND (orders.customer_email = coalesce(auth.jwt() ->> 'email', '') OR orders.user_id = auth.uid() OR public.is_admin())
        )
    );
CREATE POLICY "Enable admin manage order_items" ON public.order_items 
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Order History
CREATE POLICY "Enable read for owners or admins on order_history" ON public.order_history 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = order_history.order_id 
            AND (orders.customer_email = coalesce(auth.jwt() ->> 'email', '') OR orders.user_id = auth.uid() OR public.is_admin())
        )
    );
CREATE POLICY "Enable admin manage order_history" ON public.order_history 
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Reviews
CREATE POLICY "Reseñas son visibles para todos" ON public.reviews 
    FOR SELECT USING (true);
CREATE POLICY "Usuarios pueden insertar sus propias reseñas" ON public.reviews 
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuarios o admins pueden modificar o borrar reseñas" ON public.reviews 
    FOR ALL USING (auth.uid() = user_id OR public.is_admin())
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- Messages
CREATE POLICY "Allow public insert messages" ON public.messages 
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin manage messages" ON public.messages 
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Settings
CREATE POLICY "Allow public read settings" ON public.settings 
    FOR SELECT USING (true);
CREATE POLICY "Allow admin manage settings" ON public.settings 
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
