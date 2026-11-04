/*
# Barrios

Tabla de barrios gestionada por administradores. Cada barrio guarda su
polígono (lista de [lat, lng]) dibujado en el mapa y su centro.
Lectura pública; escritura solo para admins.
*/

CREATE TABLE IF NOT EXISTS public.barrios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL UNIQUE,
  poligono jsonb NOT NULL,
  centro_lat double precision NOT NULL,
  centro_lng double precision NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.barrios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "barrios_select_all" ON public.barrios;
CREATE POLICY "barrios_select_all" ON public.barrios FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "barrios_admin_insert" ON public.barrios;
CREATE POLICY "barrios_admin_insert" ON public.barrios FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "barrios_admin_update" ON public.barrios;
CREATE POLICY "barrios_admin_update" ON public.barrios FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "barrios_admin_delete" ON public.barrios;
CREATE POLICY "barrios_admin_delete" ON public.barrios FOR DELETE
  TO authenticated USING (public.is_admin());
