export interface Junta {
  id: string;
  nombre: string;
  barrio: string;
  delimitacion_calles: string;
  presidente_nombre: string;
  presidente_telefono: string | null;
  presidente_email: string | null;
  descripcion: string | null;
  activa: boolean;
  created_at: string;
}

export interface Miembro {
  id: string;
  junta_id: string;
  nombre: string;
  dni: string;
  direccion: string;
  telefono: string | null;
  es_fundador: boolean;
  created_at: string;
}

export interface ForoPost {
  id: string;
  junta_id: string | null;
  autor_nombre: string;
  categoria: string;
  titulo: string;
  contenido: string;
  barrio: string | null;
  prioridad: boolean;
  created_at: string;
}

export interface ForoComentario {
  id: string;
  post_id: string;
  autor_nombre: string;
  contenido: string;
  created_at: string;
}

export interface ForoApoyo {
  id: string;
  post_id: string;
  tipo: string;
  autor_nombre: string | null;
  created_at: string;
}

export interface NotaReclamo {
  id: string;
  junta_id: string | null;
  tipo_reclamo: string;
  asunto: string;
  detalle: string;
  barrio: string | null;
  estado: string;
  fecha_reclamo: string;
  created_at: string;
}

export interface ReporteFoto {
  id: string;
  junta_id: string | null;
  titulo: string;
  descripcion: string | null;
  barrio: string;
  estado: string;
  imagen_url: string;
  ubicacion_lat: number | null;
  ubicacion_lng: number | null;
  fecha_captura: string;
  created_at: string;
}

export interface Encuesta {
  id: string;
  junta_id: string | null;
  pregunta: string;
  barrio: string | null;
  activa: boolean;
  cerrada: boolean;
  created_at: string;
}

export interface EncuestaOpcion {
  id: string;
  encuesta_id: string;
  texto: string;
  created_at: string;
}

export interface EncuestaVoto {
  id: string;
  encuesta_id: string;
  opcion_id: string;
  votante_nombre: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  nombre: string;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface Alerta {
  id: string;
  junta_id: string | null;
  titulo: string;
  descripcion: string;
  barrio: string;
  nivel: string;
  activa: boolean;
  created_at: string;
}

export interface JuntaWithCounts extends Junta {
  miembros_count?: number;
  notas_count?: number;
  reportes_count?: number;
}

export interface ForoPostWithRelations extends ForoPost {
  juntas?: Pick<Junta, 'nombre' | 'barrio'> | null;
  foro_comentarios?: ForoComentario[];
  foro_apoyos?: ForoApoyo[];
}

export interface EncuestaWithRelations extends Encuesta {
  encuesta_opciones?: (EncuestaOpcion & { voto_count?: number })[];
}
