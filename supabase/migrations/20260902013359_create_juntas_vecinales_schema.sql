/*
# Juntas Vecinales de La Banda — Full Schema

This migration creates the complete database schema for the neighborhood council
management platform for the city of La Banda, Santiago del Estero.

## Tables Created

1. **juntas** — Neighborhood councils (name, barrio, street boundaries, president info)
2. **miembros** — Members/founders of each junta (name, DNI, address, phone)
3. **foro_posts** — Inter-neighborhood forum posts (category, title, content, junta)
4. **foro_comentarios** — Comments on forum posts (threaded discussion)
5. **foro_apoyos** — Support/interest votes on forum posts
6. **notas_reclamo** — Official complaint notes to the municipality (type, status, body)
7. **reportes_foto** — Photo reports of works/problems (status, barrio, image URL)
8. **encuestas** — Quick polls for neighborhood priorities
9. **encuesta_opciones** — Options for each poll
10. **encuesta_votos** — Votes on poll options
11. **alertas** — Priority/urgent community alerts

## Security

This is a public community platform with NO sign-in screen. All policies use
`TO anon, authenticated` with `USING (true)` / `WITH CHECK (true)` because the
data is intentionally public and shared across all neighborhood councils.

## Notes

- All tables use `gen_random_uuid()` for primary keys
- `created_at` defaults to `now()` on all tables
- Foreign keys enforce referential integrity with CASCADE deletes
*/

-- ============================================
-- 1. JUNTAS (Neighborhood Councils)
-- ============================================
CREATE TABLE IF NOT EXISTS juntas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  barrio text NOT NULL,
  delimitacion_calles text NOT NULL,
  presidente_nombre text NOT NULL,
  presidente_telefono text,
  presidente_email text,
  descripcion text,
  activa boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE juntas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_juntas" ON juntas;
CREATE POLICY "anon_select_juntas" ON juntas FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_juntas" ON juntas;
CREATE POLICY "anon_insert_juntas" ON juntas FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_juntas" ON juntas;
CREATE POLICY "anon_update_juntas" ON juntas FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_juntas" ON juntas;
CREATE POLICY "anon_delete_juntas" ON juntas FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================
-- 2. MIEMBROS (Council Members / Founders)
-- ============================================
CREATE TABLE IF NOT EXISTS miembros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  junta_id uuid NOT NULL REFERENCES juntas(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  dni text NOT NULL,
  direccion text NOT NULL,
  telefono text,
  es_fundador boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE miembros ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_miembros" ON miembros;
CREATE POLICY "anon_select_miembros" ON miembros FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_miembros" ON miembros;
CREATE POLICY "anon_insert_miembros" ON miembros FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_miembros" ON miembros;
CREATE POLICY "anon_update_miembros" ON miembros FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_miembros" ON miembros;
CREATE POLICY "anon_delete_miembros" ON miembros FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================
-- 3. FORO POSTS (Inter-neighborhood Forum)
-- ============================================
CREATE TABLE IF NOT EXISTS foro_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  junta_id uuid REFERENCES juntas(id) ON DELETE SET NULL,
  autor_nombre text NOT NULL,
  categoria text NOT NULL DEFAULT 'Problemática',
  titulo text NOT NULL,
  contenido text NOT NULL,
  barrio text,
  prioridad boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE foro_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_foro_posts" ON foro_posts;
CREATE POLICY "anon_select_foro_posts" ON foro_posts FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_foro_posts" ON foro_posts;
CREATE POLICY "anon_insert_foro_posts" ON foro_posts FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_foro_posts" ON foro_posts;
CREATE POLICY "anon_update_foro_posts" ON foro_posts FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_foro_posts" ON foro_posts;
CREATE POLICY "anon_delete_foro_posts" ON foro_posts FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================
-- 4. FORO COMENTARIOS (Comments)
-- ============================================
CREATE TABLE IF NOT EXISTS foro_comentarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES foro_posts(id) ON DELETE CASCADE,
  autor_nombre text NOT NULL,
  contenido text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE foro_comentarios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_foro_comentarios" ON foro_comentarios;
CREATE POLICY "anon_select_foro_comentarios" ON foro_comentarios FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_foro_comentarios" ON foro_comentarios;
CREATE POLICY "anon_insert_foro_comentarios" ON foro_comentarios FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_foro_comentarios" ON foro_comentarios;
CREATE POLICY "anon_delete_foro_comentarios" ON foro_comentarios FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================
-- 5. FORO APOYOS (Support votes)
-- ============================================
CREATE TABLE IF NOT EXISTS foro_apoyos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES foro_posts(id) ON DELETE CASCADE,
  tipo text NOT NULL DEFAULT 'Apoyar',
  autor_nombre text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE foro_apoyos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_foro_apoyos" ON foro_apoyos;
CREATE POLICY "anon_select_foro_apoyos" ON foro_apoyos FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_foro_apoyos" ON foro_apoyos;
CREATE POLICY "anon_insert_foro_apoyos" ON foro_apoyos FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_foro_apoyos" ON foro_apoyos;
CREATE POLICY "anon_delete_foro_apoyos" ON foro_apoyos FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================
-- 6. NOTAS DE RECLAMO (Official Complaint Notes)
-- ============================================
CREATE TABLE IF NOT EXISTS notas_reclamo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  junta_id uuid REFERENCES juntas(id) ON DELETE SET NULL,
  tipo_reclamo text NOT NULL,
  asunto text NOT NULL,
  detalle text NOT NULL,
  barrio text,
  estado text NOT NULL DEFAULT 'Pendiente',
  fecha_reclamo date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notas_reclamo ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_notas" ON notas_reclamo;
CREATE POLICY "anon_select_notas" ON notas_reclamo FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_notas" ON notas_reclamo;
CREATE POLICY "anon_insert_notas" ON notas_reclamo FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_notas" ON notas_reclamo;
CREATE POLICY "anon_update_notas" ON notas_reclamo FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_notas" ON notas_reclamo;
CREATE POLICY "anon_delete_notas" ON notas_reclamo FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================
-- 7. REPORTES FOTO (Photo Reports)
-- ============================================
CREATE TABLE IF NOT EXISTS reportes_foto (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  junta_id uuid REFERENCES juntas(id) ON DELETE SET NULL,
  titulo text NOT NULL,
  descripcion text,
  barrio text NOT NULL,
  estado text NOT NULL DEFAULT 'Problemática detectada',
  imagen_url text NOT NULL,
  ubicacion_lat numeric(10,7),
  ubicacion_lng numeric(10,7),
  fecha_captura date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE reportes_foto ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_reportes" ON reportes_foto;
CREATE POLICY "anon_select_reportes" ON reportes_foto FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_reportes" ON reportes_foto;
CREATE POLICY "anon_insert_reportes" ON reportes_foto FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_reportes" ON reportes_foto;
CREATE POLICY "reportes_update" ON reportes_foto FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_reportes" ON reportes_foto;
CREATE POLICY "anon_delete_reportes" ON reportes_foto FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================
-- 8. ENCUESTAS (Quick Polls)
-- ============================================
CREATE TABLE IF NOT EXISTS encuestas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  junta_id uuid REFERENCES juntas(id) ON DELETE SET NULL,
  pregunta text NOT NULL,
  barrio text,
  activa boolean NOT NULL DEFAULT true,
  cerrada boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE encuestas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_encuestas" ON encuestas;
CREATE POLICY "anon_select_encuestas" ON encuestas FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_encuestas" ON encuestas;
CREATE POLICY "anon_insert_encuestas" ON encuestas FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_encuestas" ON encuestas;
CREATE POLICY "anon_update_encuestas" ON encuestas FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_encuestas" ON encuestas;
CREATE POLICY "anon_delete_encuestas" ON encuestas FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================
-- 9. ENCUESTA OPCIONES (Poll Options)
-- ============================================
CREATE TABLE IF NOT EXISTS encuesta_opciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  encuesta_id uuid NOT NULL REFERENCES encuestas(id) ON DELETE CASCADE,
  texto text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE encuesta_opciones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_opciones" ON encuesta_opciones;
CREATE POLICY "anon_select_opciones" ON encuesta_opciones FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_opciones" ON encuesta_opciones;
CREATE POLICY "anon_insert_opciones" ON encuesta_opciones FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_opciones" ON encuesta_opciones;
CREATE POLICY "anon_delete_opciones" ON encuesta_opciones FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================
-- 10. ENCUESTA VOTOS (Poll Votes)
-- ============================================
CREATE TABLE IF NOT EXISTS encuesta_votos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  encuesta_id uuid NOT NULL REFERENCES encuestas(id) ON DELETE CASCADE,
  opcion_id uuid NOT NULL REFERENCES encuesta_opciones(id) ON DELETE CASCADE,
  votante_nombre text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE encuesta_votos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_votos" ON encuesta_votos;
CREATE POLICY "anon_select_votos" ON encuesta_votos FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_votos" ON encuesta_votos;
CREATE POLICY "anon_insert_votos" ON encuesta_votos FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_votos" ON encuesta_votos;
CREATE POLICY "anon_delete_votos" ON encuesta_votos FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================
-- 11. ALERTAS (Priority Alerts)
-- ============================================
CREATE TABLE IF NOT EXISTS alertas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  junta_id uuid REFERENCES juntas(id) ON DELETE SET NULL,
  titulo text NOT NULL,
  descripcion text NOT NULL,
  barrio text NOT NULL,
  nivel text NOT NULL DEFAULT 'Alta',
  activa boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE alertas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_alertas" ON alertas;
CREATE POLICY "anon_select_alertas" ON alertas FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_alertas" ON alertas;
CREATE POLICY "anon_insert_alertas" ON alertas FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_alertas" ON alertas;
CREATE POLICY "anon_update_alertas" ON alertas FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_alertas" ON alertas;
CREATE POLICY "anon_delete_alertas" ON alertas FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_miembros_junta_id ON miembros(junta_id);
CREATE INDEX IF NOT EXISTS idx_foro_posts_junta_id ON foro_posts(junta_id);
CREATE INDEX IF NOT EXISTS idx_foro_posts_categoria ON foro_posts(categoria);
CREATE INDEX IF NOT EXISTS idx_foro_comentarios_post_id ON foro_comentarios(post_id);
CREATE INDEX IF NOT EXISTS idx_foro_apoyos_post_id ON foro_apoyos(post_id);
CREATE INDEX IF NOT EXISTS idx_notas_junta_id ON notas_reclamo(junta_id);
CREATE INDEX IF NOT EXISTS idx_notas_estado ON notas_reclamo(estado);
CREATE INDEX IF NOT EXISTS idx_reportes_barrio ON reportes_foto(barrio);
CREATE INDEX IF NOT EXISTS idx_reportes_estado ON reportes_foto(estado);
CREATE INDEX IF NOT EXISTS idx_encuestas_junta_id ON encuestas(junta_id);
CREATE INDEX IF NOT EXISTS idx_opciones_encuesta_id ON encuesta_opciones(encuesta_id);
CREATE INDEX IF NOT EXISTS idx_votos_encuesta_id ON encuesta_votos(encuesta_id);
CREATE INDEX IF NOT EXISTS idx_votos_opcion_id ON encuesta_votos(opcion_id);
CREATE INDEX IF NOT EXISTS idx_alertas_barrio ON alertas(barrio);
CREATE INDEX IF NOT EXISTS idx_alertas_activa ON alertas(activa);
CREATE INDEX IF NOT EXISTS idx_juntas_barrio ON juntas(barrio);