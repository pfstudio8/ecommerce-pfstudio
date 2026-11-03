-- =============================================================================
-- Migration: Phase 2 Admin Enhancements (Fase 2)
-- Description:
--   1. Add active column to profiles (for logical soft-delete / user deactivation)
--   2. Seed default landing_texts into settings table
-- =============================================================================

-- 1. profiles.active
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'active'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN active BOOLEAN NOT NULL DEFAULT true;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_active ON public.profiles(active);

-- 2. Seed default landing_texts in settings
INSERT INTO public.settings (key, value)
VALUES (
    'landing_texts',
    '{
        "badge": "Taller de Estampado & Sublimación Integral",
        "title": "PFSTUDIO — Sublimación Integral, Remeras & Diseños a Medida",
        "subtitle": "Sublimación integral en todo tipo de insumos: Remeras Boxy Fit, Gorras, Chopps, Tazas, Llaveros, Vasos y más. Personalizá tus productos en tiempo real con la mejor calidad y diseños únicos.",
        "promo": "🔥 10% OFF pagando por transferencia bancaria directa"
    }'::jsonb
)
ON CONFLICT (key) DO NOTHING;

