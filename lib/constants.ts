export const BARRIOS_LA_BANDA = [
  'Centro',
  'Barrio Obrero',
  'Santa Catalina',
  'Belgrano',
  'Sarmiento',
  'General Paz',
  'Mitre',
  'San Martín',
  'Rivadavia',
  'Alberdi',
  'Indio Muerto',
  'El Ceibo',
  'San Fernando',
  'Costa de la Quebrada',
  'Juan Manuel de Rosas',
  'Mariano Moreno',
  'Villa Dorada',
  'La Banda Este',
  'Autódromo',
  'Campamento',
] as const;

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

// Approximate lat/lng for barrios in La Banda for map placement
export const BARRIO_COORDS: Record<string, { lat: number; lng: number }> = {
  Centro: { lat: -27.749, lng: -64.261 },
  'Barrio Obrero': { lat: -27.745, lng: -64.255 },
  'Santa Catalina': { lat: -27.738, lng: -64.248 },
  Belgrano: { lat: -27.754, lng: -64.268 },
  Sarmiento: { lat: -27.742, lng: -64.272 },
  'General Paz': { lat: -27.735, lng: -64.265 },
  Mitre: { lat: -27.758, lng: -64.255 },
  'San Martín': { lat: -27.732, lng: -64.258 },
  Rivadavia: { lat: -27.762, lng: -64.275 },
  Alberdi: { lat: -27.740, lng: -64.282 },
  'Indio Muerto': { lat: -27.728, lng: -64.245 },
  'El Ceibo': { lat: -27.768, lng: -64.250 },
  'San Fernando': { lat: -27.751, lng: -64.290 },
  'Costa de la Quebrada': { lat: -27.772, lng: -64.270 },
  'Juan Manuel de Rosas': { lat: -27.730, lng: -64.285 },
  'Mariano Moreno': { lat: -27.765, lng: -64.285 },
  'Villa Dorada': { lat: -27.758, lng: -64.242 },
  'La Banda Este': { lat: -27.745, lng: -64.235 },
  Autódromo: { lat: -27.774, lng: -64.292 },
  Campamento: { lat: -27.780, lng: -64.260 },
};

export const LA_BANDA_CENTER = { lat: -27.75, lng: -64.26 };
