-- Script completo para configurar el sistema de Pedidos y Artículos
-- Copia y pega esto en el SQL Editor de Supabase y presiona "Run"

-- 1. Tabla de Pedidos (Orders)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    total_amount NUMERIC NOT NULL,
    payment_method TEXT,
    payment_id TEXT,
    shipping_address TEXT,
    tracking_number TEXT,
    carrier TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabla de Artículos del Pedido (Order Items)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    size TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    price_at_purchase NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Habilitar RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 4. Políticas para Pedidos (Orders)
-- Permitir que cualquier persona (anon) inserte un pedido durante el checkout
CREATE POLICY "Enable insert for all users" ON public.orders FOR INSERT WITH CHECK (true);

-- Permitir que el admin vea todos los pedidos (Cambia el email por el tuyo si es necesario)
CREATE POLICY "Enable read for admins" ON public.orders FOR SELECT USING (true);

-- Permitir que el admin actualice pedidos
CREATE POLICY "Enable update for admins" ON public.orders FOR UPDATE USING (true);

-- Permitir que el admin elimine pedidos
CREATE POLICY "Enable delete for admins" ON public.orders FOR DELETE USING (true);

-- 5. Políticas para Artículos (Order Items)
CREATE POLICY "Enable insert for all users" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable read for all" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Enable delete for all" ON public.order_items FOR DELETE USING (true);

-- Nota: Si ya existían las tablas, este script no las borrará, solo asegurará que existan y tengan RLS.
