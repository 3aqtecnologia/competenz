-- 1. Add Disponibilidade Column
ALTER TABLE public.docentes
ADD COLUMN IF NOT EXISTS disponibilidade JSONB DEFAULT '[]'::jsonb;
-- 2. Create Junction Table for Areas (Many-to-Many)
CREATE TABLE IF NOT EXISTS public.docentes_areas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    docente_id UUID NOT NULL REFERENCES public.docentes(id) ON DELETE CASCADE,
    area_id UUID NOT NULL REFERENCES public.areas_tecnologicas(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(docente_id, area_id)
);
-- RLS Policies
ALTER TABLE public.docentes_areas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.docentes_areas FOR
SELECT USING (true);
CREATE POLICY "Enable all access for all users" ON public.docentes_areas FOR ALL USING (true);