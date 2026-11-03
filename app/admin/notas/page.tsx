'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { NotaReclamo } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { NOTA_ESTADO_STYLES } from '@/lib/constants';
import { formatDate } from '@/lib/format';
import { FileText, MapPin, ArrowRight, Clock, CheckCircle2, Eye } from 'lucide-react';

const estados = ['Pendiente', 'En revisión', 'Solucionado'];

export default function AdminNotasPage() {
  const [notas, setNotas] = useState<NotaReclamo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<string>('all');

  useEffect(() => {
    loadNotas();
  }, []);

  async function loadNotas() {
    setLoading(true);
    const { data, error } = await supabase
      .from('notas_reclamo')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Error al cargar reclamos');
    } else {
      setNotas((data as NotaReclamo[]) || []);
    }
    setLoading(false);
  }

  async function cambiarEstado(nota: NotaReclamo, nuevoEstado: string) {
    const { error } = await supabase
      .from('notas_reclamo')
      .update({ estado: nuevoEstado })
      .eq('id', nota.id);

    if (error) {
      toast.error('No se pudo actualizar el estado');
    } else {
      toast.success(`Estado actualizado a ${nuevoEstado}`);
      loadNotas();
    }
  }

  const filtradas =
    filtroEstado === 'all'
      ? notas
      : notas.filter((n) => n.estado === filtroEstado);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Reclamos al Municipio</h1>
          <p className="text-muted-foreground">
            Revisá y gestioná las notas de reclamo de los vecinos.
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
        <p className="text-sm text-muted-foreground">Cargando reclamos...</p>
      ) : filtradas.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay reclamos para mostrar.</p>
      ) : (
        <div className="grid gap-4">
          {filtradas.map((nota) => {
            const style = NOTA_ESTADO_STYLES[nota.estado] || NOTA_ESTADO_STYLES.Pendiente;
            return (
              <Card key={nota.id}>
                <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{nota.asunto}</h3>
                      <Badge className={style.bg}>
                        <span className={style.color}>{nota.estado}</span>
                      </Badge>
                    </div>
                    <p className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {nota.barrio ?? 'Sin barrio'} · {nota.tipo_reclamo}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {nota.detalle}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Fecha del reclamo: {formatDate(nota.fecha_reclamo)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:items-end">
                    <Button asChild variant="outline" size="sm" className="gap-1">
                      <Link href={`/notas/${nota.id}`}>
                        Ver detalle <ArrowRight className="h-3 w-3" />
                      </Link>
                    </Button>
                    <Select
                      value={nota.estado}
                      onValueChange={(v) => cambiarEstado(nota, v)}
                    >
                      <SelectTrigger className="w-[160px]">
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
            );
          })}
        </div>
      )}
    </div>
  );
}
