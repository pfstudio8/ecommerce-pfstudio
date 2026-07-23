-- Script para crear tablas necesarias para el Panel de Administrador Completo y Asegurar RLS

-- 1. Tabla de Categorías (Opcional si quieres dinámicas)
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insertar las iniciales
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

-- 2. Tabla de Mensajes (Para página de contacto)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabla de Configuración (Settings)
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insertar configuración inicial
INSERT INTO public.settings (key, value)
VALUES 
    ('store_info', '{"whatsapp": "5491100000000", "email": "contacto@pfstudio.com", "instagram": "@pfstudio"}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 4. Habilitar RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- 5. Eliminar políticas antiguas para evitar duplicados
DROP POLICY IF EXISTS "Allow public read categories" ON public.categories;
DROP POLICY IF EXISTS "Allow public insert messages" ON public.messages;
DROP POLICY IF EXISTS "Allow anon everything categories" ON public.categories;
DROP POLICY IF EXISTS "Allow anon everything messages" ON public.messages;
DROP POLICY IF EXISTS "Allow anon everything settings" ON public.settings;

-- 6. Crear Políticas RLS Robustas y Seguras
-- Categorías
CREATE POLICY "Allow public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow admin manage categories" ON public.categories 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());

-- Mensajes (Contacto)
CREATE POLICY "Allow public insert messages" ON public.messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin manage messages" ON public.messages 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());

-- Configuraciones (Settings)
CREATE POLICY "Allow public read settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Allow admin manage settings" ON public.settings 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());
