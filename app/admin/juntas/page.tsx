'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Junta } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, MapPin, Users, ArrowRight } from 'lucide-react';

export default function AdminJuntasPage() {
  const [juntas, setJuntas] = useState<Junta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJuntas();
  }, []);

  async function loadJuntas() {
    setLoading(true);
    const { data, error } = await supabase
      .from('juntas')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Error al cargar juntas vecinales');
    } else {
      setJuntas((data as Junta[]) || []);
    }
    setLoading(false);
  }

  async function toggleActiva(junta: Junta) {
    const { error } = await supabase
      .from('juntas')
      .update({ activa: !junta.activa })
      .eq('id', junta.id);

    if (error) {
      toast.error('No se pudo actualizar la junta');
    } else {
      toast.success(junta.activa ? 'Junta desactivada' : 'Junta aprobada');
      loadJuntas();
    }
  }

  const pendientes = juntas.filter((j) => !j.activa);
  const activas = juntas.filter((j) => j.activa);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Gestión de Juntas Vecinales</h1>
        <p className="text-muted-foreground">
          Aprobá o desactivá juntas vecinales registradas en la plataforma.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Cargando juntas...</p>
      ) : (
        <div className="space-y-6">
          {pendientes.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-display text-lg font-semibold">
                Solicitudes pendientes{' '}
                <Badge variant="destructive">{pendientes.length}</Badge>
              </h2>
              <div className="grid gap-4">
                {pendientes.map((junta) => (
                  <JuntaCard key={junta.id} junta={junta} onToggle={() => toggleActiva(junta)} />
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h2 className="font-display text-lg font-semibold">
              Juntas activas{' '}
              <Badge variant="secondary">{activas.length}</Badge>
            </h2>
            {activas.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay juntas activas.</p>
            ) : (
              <div className="grid gap-4">
                {activas.map((junta) => (
                  <JuntaCard key={junta.id} junta={junta} onToggle={() => toggleActiva(junta)} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function JuntaCard({ junta, onToggle }: { junta: Junta; onToggle: () => void }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{junta.nombre}</h3>
            {junta.activa ? (
              <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-600">
                Activa
              </Badge>
            ) : (
              <Badge variant="secondary">Pendiente</Badge>
            )}
          </div>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {junta.barrio}
          </p>
          <p className="text-sm text-muted-foreground">
            Presidente: {junta.presidente_nombre}
            {junta.presidente_telefono && ` · ${junta.presidente_telefono}`}
          </p>
          <p className="text-sm text-muted-foreground">
            Delimitación: {junta.delimitacion_calles}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end">
          <Button asChild variant="outline" size="sm" className="gap-1">
            <Link href={`/juntas/${junta.id}`}>
              Ver detalle <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
          <Button
            size="sm"
            variant={junta.activa ? 'destructive' : 'default'}
            onClick={onToggle}
            className="gap-1"
          >
            {junta.activa ? (
              <>
                <XCircle className="h-4 w-4" /> Desactivar
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" /> Aprobar
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
