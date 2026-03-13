-- Script para crear tablas necesarias para el Panel de Administrador Completo

-- 1. Tabla de Categorías (Opcional si quieres dinámicas, si no asume 'Clásicas', 'Boxy Fit', 'Oversize')
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
    ('Oversize', 'Remeras sueltas y largas')
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

-- Configurar Políticas de Seguridad RLS básicas:
-- Para simplificar la demo, habilitar anon para messages (inserción) y admin para select.
-- Asumiendo que has estado trabajando sin RLS estricto o con políticas ya definidas para orders/products.
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow public insert messages" ON public.messages FOR INSERT WITH CHECK (true);
-- Las políticas de lectura/modificación para admins deben asignarse según tu setup actual. Si no estás usando RLS estricto:
CREATE POLICY "Allow anon everything categories" ON public.categories USING (true);
CREATE POLICY "Allow anon everything messages" ON public.messages USING (true);
CREATE POLICY "Allow anon everything settings" ON public.settings USING (true);
