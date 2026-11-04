'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Trash2, Undo2, Eraser, Save } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useBarrios } from '@/lib/use-barrios';
import { LA_BANDA_CENTER } from '@/lib/constants';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const BarrioDrawMap = dynamic(() => import('@/components/barrio-draw-map'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-muted/50">
      <p className="text-sm text-muted-foreground">Cargando mapa...</p>
    </div>
  ),
});

function centroid(points: [number, number][]) {
  const lat = points.reduce((s, p) => s + p[0], 0) / points.length;
  const lng = points.reduce((s, p) => s + p[1], 0) / points.length;
  return { lat, lng };
}

export default function AdminBarriosPage() {
  const { barrios, loading, reload } = useBarrios();
  const [nombre, setNombre] = useState('');
  const [points, setPoints] = useState<[number, number][]>([]);
  const [saving, setSaving] = useState(false);

  const existing = useMemo(
    () => barrios.map((b) => ({ id: b.id, nombre: b.nombre, poligono: b.poligono })),
    [barrios]
  );

  async function handleSave() {
    const name = nombre.trim();
    if (!name) {
      toast.error('Ingresá el nombre del barrio');
      return;
    }
    if (points.length < 3) {
      toast.error('Marcá al menos 3 puntos en el mapa para formar el barrio');
      return;
    }
    setSaving(true);
    const c = centroid(points);
    const { error } = await supabase.from('barrios').insert({
      nombre: name,
      poligono: points,
      centro_lat: c.lat,
      centro_lng: c.lng,
    });
    setSaving(false);
    if (error) {
      toast.error(error.code === '23505' ? 'Ya existe un barrio con ese nombre' : 'No se pudo guardar el barrio');
      return;
    }
    toast.success('Barrio agregado');
    setNombre('');
    setPoints([]);
    reload();
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`¿Eliminar el barrio "${name}"?`)) return;
    const { error } = await supabase.from('barrios').delete().eq('id', id);
    if (error) {
      toast.error('No se pudo eliminar el barrio');
      return;
    }
    toast.success('Barrio eliminado');
    reload();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight">
          <MapPin className="h-6 w-6 text-primary" />
          Barrios
        </h1>
        <p className="text-muted-foreground">
          Dibujá la forma de cada barrio haciendo clic en el mapa para marcar sus vértices.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="overflow-hidden border-border/60">
            <div className="relative h-[520px] w-full">
              <BarrioDrawMap
                center={LA_BANDA_CENTER}
                points={points}
                onPointsChange={setPoints}
                existing={existing}
              />
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-4 p-5">
              <div className="space-y-2">
                <Label htmlFor="nombre-barrio">Nombre del barrio</Label>
                <Input
                  id="nombre-barrio"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Barrio Centro"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Puntos marcados: <span className="font-semibold text-foreground">{points.length}</span>
                {points.length < 3 && ' (mínimo 3)'}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  disabled={points.length === 0}
                  onClick={() => setPoints((p) => p.slice(0, -1))}
                >
                  <Undo2 className="h-4 w-4" />
                  Deshacer punto
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  disabled={points.length === 0}
                  onClick={() => setPoints([])}
                >
                  <Eraser className="h-4 w-4" />
                  Limpiar
                </Button>
              </div>
              <Button className="w-full gap-2" onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4" />
                {saving ? 'Guardando...' : 'Guardar barrio'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h3 className="font-display text-sm font-bold">Barrios cargados ({barrios.length})</h3>
              {loading ? (
                <p className="mt-2 text-sm text-muted-foreground">Cargando...</p>
              ) : barrios.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">Todavía no hay barrios.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {barrios.map((b) => (
                    <li key={b.id} className="flex items-center justify-between gap-2 text-sm">
                      <span className="font-medium">{b.nombre}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDelete(b.id, b.nombre)}
                        aria-label={`Eliminar ${b.nombre}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
