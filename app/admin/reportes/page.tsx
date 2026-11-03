'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ReporteFoto } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { formatDate } from '@/lib/format';
import { MapPin, ArrowRight } from 'lucide-react';

const estados = ['Problemática detectada', 'En gestión', 'Obra realizada'];

export default function AdminReportesPage() {
  const [reportes, setReportes] = useState<ReporteFoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<string>('all');

  useEffect(() => {
    loadReportes();
  }, []);

  async function loadReportes() {
    setLoading(true);
    const { data, error } = await supabase
      .from('reportes_foto')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Error al cargar reportes');
    } else {
      setReportes((data as ReporteFoto[]) || []);
    }
    setLoading(false);
  }

  async function cambiarEstado(reporte: ReporteFoto, nuevoEstado: string) {
    const { error } = await supabase
      .from('reportes_foto')
      .update({ estado: nuevoEstado })
      .eq('id', reporte.id);

    if (error) {
      toast.error('No se pudo actualizar el estado');
    } else {
      toast.success(`Estado actualizado a ${nuevoEstado}`);
      loadReportes();
    }
  }

  const filtrados =
    filtroEstado === 'all'
      ? reportes
      : reportes.filter((r) => r.estado === filtroEstado);

  const estadoBadge = (estado: string) => {
    switch (estado) {
      case 'Problemática detectada':
        return 'bg-red-100 text-red-700 hover:bg-red-100';
      case 'En gestión':
        return 'bg-amber-100 text-amber-700 hover:bg-amber-100';
      case 'Obra realizada':
        return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Reportes Fotográficos</h1>
          <p className="text-muted-foreground">
            Visualizá y actualizá el estado de los reportes ciudadanos.
          </p>
        </div>
        <Select value={filtroEstado} onValueChange={setFiltroEstado}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {estados.map((e) => (
              <SelectItem key={e} value={e}>
                {e}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Cargando reportes...</p>
      ) : filtrados.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay reportes para mostrar.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtrados.map((reporte) => (
            <Card key={reporte.id} className="overflow-hidden">
              <div className="relative aspect-video overflow-hidden bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={reporte.imagen_url}
                  alt={reporte.titulo}
                  className="h-full w-full object-cover"
                />
              </div>
              <CardContent className="space-y-3 p-4">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold line-clamp-1">{reporte.titulo}</h3>
                    <Badge className={estadoBadge(reporte.estado)}>{reporte.estado}</Badge>
                  </div>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {reporte.barrio} · {formatDate(reporte.fecha_captura)}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {reporte.descripcion}
                </p>
                <div className="flex flex-col gap-2">
                  <Button asChild variant="outline" size="sm" className="gap-1">
                    <Link href={`/reportes`}>
                      Ver en galería <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Button>
                  <Select
                    value={reporte.estado}
                    onValueChange={(v) => cambiarEstado(reporte, v)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Cambiar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {estados.map((e) => (
                        <SelectItem key={e} value={e}>
                          {e}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
