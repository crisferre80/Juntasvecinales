export const FORO_CATEGORIAS = [
  'Problemática',
  'Propuesta de Solución',
  'Aviso Comunitario',
  'Evento',
] as const;

export const FORO_CATEGORIA_STYLES: Record<string, { color: string; bg: string; label: string }> = {
  Problemática: { color: 'text-red-700', bg: 'bg-red-50 border-red-200', label: 'Problemática' },
  'Propuesta de Solución': { color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', label: 'Propuesta' },
  'Aviso Comunitario': { color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', label: 'Aviso' },
  Evento: { color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', label: 'Evento' },
};

export const TIPOS_RECLAMO = [
  'Alumbrado',
  'Bacheo',
  'Limpieza',
  'Seguridad',
  'Agua / Cloacas',
  'Espacios Verdes',
  'Transporte',
  'Otros',
] as const;

export const NOTA_ESTADOS = ['Pendiente', 'En revisión', 'Solucionado'] as const;

export const NOTA_ESTADO_STYLES: Record<string, { color: string; bg: string; dot: string }> = {
  Pendiente: { color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', dot: 'bg-amber-500' },
  'En revisión': { color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', dot: 'bg-blue-500' },
  Solucionado: { color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500' },
};

export const REPORTE_ESTADOS = [
  'Problemática detectada',
  'En gestión',
  'Obra realizada',
] as const;

export const REPORTE_ESTADO_STYLES: Record<string, { color: string; bg: string; dot: string }> = {
  'Problemática detectada': { color: 'text-red-700', bg: 'bg-red-50 border-red-200', dot: 'bg-red-500' },
  'En gestión': { color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', dot: 'bg-blue-500' },
  'Obra realizada': { color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500' },
};

export const ALERTA_NIVELES = ['Crítica', 'Alta', 'Media'] as const;

export const ALERTA_NIVEL_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  Crítica: { color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300' },
  Alta: { color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-300' },
  Media: { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300' },
};

export const APOYO_TIPOS = ['Apoyar reclamo', 'Me interesa'] as const;

export const APOYO_STYLES: Record<string, { active: string; inactive: string; icon: string }> = {
  'Apoyar reclamo': { active: 'bg-red-600 text-white border-red-600', inactive: 'border-red-200 text-red-700 hover:bg-red-50', icon: 'hand' },
  'Me interesa': { active: 'bg-blue-600 text-white border-blue-600', inactive: 'border-blue-200 text-blue-700 hover:bg-blue-50', icon: 'thumbs-up' },
};

export const LA_BANDA_CENTER = { lat: -27.75, lng: -64.26 };
