/*
# Authentication, Profiles & Admin Roles

This migration adds:
1. A public.profiles table linked to auth.users
2. RLS policies so users can read/update their own profile
3. Admin-only policies for sensitive operations
4. Updated RLS on existing tables: public read remains open,
   but INSERT/UPDATE/DELETE now requires authentication.

Default admin can be created manually in Supabase Auth, then:
  INSERT INTO public.profiles (id, email, nombre, role)
  VALUES ('<auth-user-id>', 'admin@example.com', 'Administrador', 'admin');
*/

-- ============================================
-- 1. PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  nombre text NOT NULL,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Helper function: must exist before policies that reference it
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Profiles: users can read their own; admins can read all
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()
    OR public.is_admin()
  );

-- Allow anon to read profile metadata needed for admin checks (optional, guarded by app logic)
DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;
CREATE POLICY "profiles_select_public"
  ON public.profiles FOR SELECT
  TO anon
  USING (false);

-- Profiles: users can update their own name
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Profiles: only service role/admins can insert/delete (handled outside RLS or via trigger)

-- ============================================
-- 3. AUTO-CREATE PROFILE ON USER SIGNUP
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nombre, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 4. UPDATE RLS POLICIES FOR EXISTING TABLES
-- Read stays open for public landing; writes require auth.
-- Admin-only operations are restricted via is_admin().
-- ============================================

-- JUNTAS
DROP POLICY IF EXISTS "anon_insert_juntas" ON juntas;
DROP POLICY IF EXISTS "anon_update_juntas" ON juntas;
DROP POLICY IF EXISTS "anon_delete_juntas" ON juntas;

DROP POLICY IF EXISTS "auth_insert_juntas" ON juntas;
CREATE POLICY "auth_insert_juntas" ON juntas FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_juntas" ON juntas;
CREATE POLICY "admin_update_juntas" ON juntas FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_juntas" ON juntas;
CREATE POLICY "admin_delete_juntas" ON juntas FOR DELETE
  TO authenticated USING (public.is_admin());

-- MIEMBROS
DROP POLICY IF EXISTS "anon_insert_miembros" ON miembros;
DROP POLICY IF EXISTS "anon_update_miembros" ON miembros;
DROP POLICY IF EXISTS "anon_delete_miembros" ON miembros;

DROP POLICY IF EXISTS "auth_insert_miembros" ON miembros;
CREATE POLICY "auth_insert_miembros" ON miembros FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_miembros" ON miembros;
CREATE POLICY "admin_update_miembros" ON miembros FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_miembros" ON miembros;
CREATE POLICY "admin_delete_miembros" ON miembros FOR DELETE
  TO authenticated USING (public.is_admin());

-- FORO_POSTS
DROP POLICY IF EXISTS "anon_insert_foro_posts" ON foro_posts;
DROP POLICY IF EXISTS "anon_update_foro_posts" ON foro_posts;
DROP POLICY IF EXISTS "anon_delete_foro_posts" ON foro_posts;

DROP POLICY IF EXISTS "auth_insert_foro_posts" ON foro_posts;
CREATE POLICY "auth_insert_foro_posts" ON foro_posts FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_foro_posts" ON foro_posts;
CREATE POLICY "admin_update_foro_posts" ON foro_posts FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_foro_posts" ON foro_posts;
CREATE POLICY "admin_delete_foro_posts" ON foro_posts FOR DELETE
  TO authenticated USING (public.is_admin());

-- FORO_COMENTARIOS
DROP POLICY IF EXISTS "anon_insert_foro_comentarios" ON foro_comentarios;
DROP POLICY IF EXISTS "anon_delete_foro_comentarios" ON foro_comentarios;

DROP POLICY IF EXISTS "auth_insert_foro_comentarios" ON foro_comentarios;
CREATE POLICY "auth_insert_foro_comentarios" ON foro_comentarios FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_foro_comentarios" ON foro_comentarios;
CREATE POLICY "admin_delete_foro_comentarios" ON foro_comentarios FOR DELETE
  TO authenticated USING (public.is_admin());

-- FORO_APOYOS
DROP POLICY IF EXISTS "anon_insert_foro_apoyos" ON foro_apoyos;
DROP POLICY IF EXISTS "anon_delete_foro_apoyos" ON foro_apoyos;

DROP POLICY IF EXISTS "auth_insert_foro_apoyos" ON foro_apoyos;
CREATE POLICY "auth_insert_foro_apoyos" ON foro_apoyos FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_foro_apoyos" ON foro_apoyos;
CREATE POLICY "admin_delete_foro_apoyos" ON foro_apoyos FOR DELETE
  TO authenticated USING (public.is_admin());

-- NOTAS_RECLAMO
DROP POLICY IF EXISTS "anon_insert_notas" ON notas_reclamo;
DROP POLICY IF EXISTS "anon_update_notas" ON notas_reclamo;
DROP POLICY IF EXISTS "anon_delete_notas" ON notas_reclamo;

DROP POLICY IF EXISTS "auth_insert_notas" ON notas_reclamo;
CREATE POLICY "auth_insert_notas" ON notas_reclamo FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_notas" ON notas_reclamo;
CREATE POLICY "admin_update_notas" ON notas_reclamo FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_notas" ON notas_reclamo;
CREATE POLICY "admin_delete_notas" ON notas_reclamo FOR DELETE
  TO authenticated USING (public.is_admin());

-- REPORTES_FOTO
DROP POLICY IF EXISTS "anon_insert_reportes" ON reportes_foto;
DROP POLICY IF EXISTS "reportes_update" ON reportes_foto;
DROP POLICY IF EXISTS "anon_delete_reportes" ON reportes_foto;

DROP POLICY IF EXISTS "auth_insert_reportes" ON reportes_foto;
CREATE POLICY "auth_insert_reportes" ON reportes_foto FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_reportes" ON reportes_foto;
CREATE POLICY "admin_update_reportes" ON reportes_foto FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_reportes" ON reportes_foto;
CREATE POLICY "admin_delete_reportes" ON reportes_foto FOR DELETE
  TO authenticated USING (public.is_admin());

-- ENCUESTAS
DROP POLICY IF EXISTS "anon_insert_encuestas" ON encuestas;
DROP POLICY IF EXISTS "anon_update_encuestas" ON encuestas;
DROP POLICY IF EXISTS "anon_delete_encuestas" ON encuestas;

DROP POLICY IF EXISTS "admin_insert_encuestas" ON encuestas;
CREATE POLICY "admin_insert_encuestas" ON encuestas FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_update_encuestas" ON encuestas;
CREATE POLICY "admin_update_encuestas" ON encuestas FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_encuestas" ON encuestas;
CREATE POLICY "admin_delete_encuestas" ON encuestas FOR DELETE
  TO authenticated USING (public.is_admin());

-- ENCUESTA_OPCIONES
DROP POLICY IF EXISTS "anon_insert_opciones" ON encuesta_opciones;
DROP POLICY IF EXISTS "anon_delete_opciones" ON encuesta_opciones;

DROP POLICY IF EXISTS "admin_insert_opciones" ON encuesta_opciones;
CREATE POLICY "admin_insert_opciones" ON encuesta_opciones FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_opciones" ON encuesta_opciones;
CREATE POLICY "admin_delete_opciones" ON encuesta_opciones FOR DELETE
  TO authenticated USING (public.is_admin());

-- ENCUESTA_VOTOS
DROP POLICY IF EXISTS "anon_insert_votos" ON encuesta_votos;
DROP POLICY IF EXISTS "anon_delete_votos" ON encuesta_votos;

DROP POLICY IF EXISTS "auth_insert_votos" ON encuesta_votos;
CREATE POLICY "auth_insert_votos" ON encuesta_votos FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_votos" ON encuesta_votos;
CREATE POLICY "admin_delete_votos" ON encuesta_votos FOR DELETE
  TO authenticated USING (public.is_admin());

-- ALERTAS
DROP POLICY IF EXISTS "anon_insert_alertas" ON alertas;
DROP POLICY IF EXISTS "anon_update_alertas" ON alertas;
DROP POLICY IF EXISTS "anon_delete_alertas" ON alertas;

DROP POLICY IF EXISTS "admin_insert_alertas" ON alertas;
CREATE POLICY "admin_insert_alertas" ON alertas FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_update_alertas" ON alertas;
CREATE POLICY "admin_update_alertas" ON alertas FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_alertas" ON alertas;
CREATE POLICY "admin_delete_alertas" ON alertas FOR DELETE
  TO authenticated USING (public.is_admin());
