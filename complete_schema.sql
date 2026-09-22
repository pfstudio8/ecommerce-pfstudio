-- Script completo para configurar el sistema de Pedidos, Artículos, Seguridad RLS y Utilidades

-- 1. Tabla de Usuarios Administradores (Seguridad)
CREATE TABLE IF NOT EXISTS public.admin_users (
    email TEXT PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insertar administrador por defecto
INSERT INTO public.admin_users (email)
VALUES ('facundo@pfstudio.com')
ON CONFLICT (email) DO NOTHING;

-- 2. Función para verificar si el usuario logueado es Administrador (SECURITY DEFINER para omitir permisos select)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.admin_users 
        WHERE email = coalesce(auth.jwt() ->> 'email', '')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Tabla de Pedidos (Orders) con payment_id UNIQUE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    total_amount NUMERIC NOT NULL,
    payment_method TEXT,
    payment_id TEXT UNIQUE,
    shipping_address TEXT,
    tracking_number TEXT,
    carrier TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabla de Artículos del Pedido (Order Items)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    size TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    price_at_purchase NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Habilitar RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 6. Políticas para admin_users
CREATE POLICY "Allow admin read admin_users" ON public.admin_users FOR SELECT USING (public.is_admin());
CREATE POLICY "Allow admin edit admin_users" ON public.admin_users USING (public.is_admin());

-- 7. Políticas para Pedidos (Orders)
-- Nota: La inserción se realiza exclusivamente por el servidor usando service_role
CREATE POLICY "Enable read for owners or admins" ON public.orders FOR SELECT 
USING (coalesce(auth.jwt() ->> 'email', '') = customer_email OR public.is_admin());
CREATE POLICY "Enable update for admins" ON public.orders FOR UPDATE USING (public.is_admin());
CREATE POLICY "Enable delete for admins" ON public.orders FOR DELETE USING (public.is_admin());

-- 8. Políticas para Artículos (Order Items)
-- Nota: La inserción se realiza exclusivamente por el servidor usando service_role
CREATE POLICY "Enable read for owners or admins" ON public.order_items FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.orders 
        WHERE id = order_id AND (customer_email = coalesce(auth.jwt() ->> 'email', '') OR public.is_admin())
    )
);
CREATE POLICY "Enable delete for admins" ON public.order_items FOR DELETE USING (public.is_admin());

-- 9. Función Atómica para Descontar Stock (Evita Race Conditions)
CREATE OR REPLACE FUNCTION public.decrement_stock(p_id uuid, p_size text, p_qty int)
RETURNS void AS $$
BEGIN
    -- 1. Descontar del stock específico de la talla (product_stock)
    UPDATE public.product_stock
    SET stock_quantity = stock_quantity - p_qty
    WHERE product_id = p_id AND size = p_size AND stock_quantity >= p_qty;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'INSUFFICIENT_STOCK: No hay suficiente stock para el producto % talle %', p_id, p_size;
    END IF;

    -- 2. Descontar del stock consolidado heredado (products)
    UPDATE public.products
    SET stock = stock - p_qty
    WHERE id = p_id AND stock >= p_qty;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'INSUFFICIENT_STOCK: No hay suficiente stock total para el producto %', p_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 10. Vista Consolidada para Directorio de Clientes (Evita procesamiento N+1 en memoria)
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
    coalesce(o.total_orders, 0) as total_orders,
    coalesce(o.total_spent, 0) as total_spent,
    coalesce(o.first_seen, p.created_at) as first_seen,
    coalesce(o.last_seen, p.created_at) as last_seen
FROM public.profiles p
FULL OUTER JOIN order_stats o ON p.email = o.customer_email;

-- Permisos para la vista en Supabase
GRANT SELECT ON public.customer_profiles TO service_role;

-- 11. Tabla de Reseñas (Reviews)
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies para Reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reseñas son visibles para todos" 
ON public.reviews FOR SELECT 
USING (true);

CREATE POLICY "Usuarios pueden insertar sus propias reseñas" 
ON public.reviews FOR INSERT 
WITH CHECK (auth.uid() = user_id);

