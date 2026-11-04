'use client';

import { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  Map as MapIcon,
  MapPin,
  Building2,
  AlertTriangle,
  Camera,
  FileText,
  Layers,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Junta, Alerta, ReporteFoto, NotaReclamo } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LA_BANDA_CENTER, ALERTA_NIVEL_STYLES } from '@/lib/constants';
import { useBarrios } from '@/lib/use-barrios';
import { cn } from '@/lib/utils';
import type { MapMarkerData } from '@/components/leaflet-map';

const LeafletMap = dynamic(() => import('@/components/leaflet-map'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-muted/50">
      <p className="text-sm text-muted-foreground">Cargando mapa...</p>
    </div>
  ),
});

type LayerType = 'juntas' | 'alertas' | 'reportes' | 'notas';

export default function AdminMapaPage() {
  const { barrios } = useBarrios();
  const [juntas, setJuntas] = useState<Junta[]>([]);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [reportes, setReportes] = useState<ReporteFoto[]>([]);
  const [notas, setNotas] = useState<NotaReclamo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLayer, setActiveLayer] = useState<LayerType>('juntas');
  const [selectedBarrio, setSelectedBarrio] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [j, a, r, n] = await Promise.all([
        supabase.from('juntas').select('*'),
        supabase.from('alertas').select('*'),
        supabase.from('reportes_foto').select('*'),
        supabase.from('notas_reclamo').select('*'),
      ]);
      setJuntas((j.data as Junta[]) || []);
      setAlertas((a.data as Alerta[]) || []);
      setReportes((r.data as ReporteFoto[]) || []);
      setNotas((n.data as NotaReclamo[]) || []);
      setLoading(false);
    }
    load();
  }, []);

  const barrioCounts = useMemo(() => {
    const counts: Record<string, { juntas: number; juntasInactivas: number; alertas: number; reportes: number; notas: number }> = {};
    barrios.forEach((b) => {
      counts[b.nombre] = { juntas: 0, juntasInactivas: 0, alertas: 0, reportes: 0, notas: 0 };
    });
    juntas.forEach((j) => {
      if (counts[j.barrio]) {
        if (j.activa) counts[j.barrio].juntas++;
        else counts[j.barrio].juntasInactivas++;
      }
    });
    alertas.forEach((a) => {
      if (counts[a.barrio]) counts[a.barrio].alertas++;
    });
    reportes.forEach((r) => {
      if (counts[r.barrio]) counts[r.barrio].reportes++;
    });
    notas.forEach((n) => {
      if (n.barrio && counts[n.barrio]) counts[n.barrio].notas++;
    });
    return counts;
  }, [barrios, juntas, alertas, reportes, notas]);

  const layerColors: Record<LayerType, string> = {
    juntas: 'primary',
    alertas: 'red',
    reportes: 'accent',
    notas: 'amber',
  };

  const markers: MapMarkerData[] = useMemo(() => {
    return barrios.map((b) => {
      const count = barrioCounts[b.nombre]?.[activeLayer] || 0;
      const color = count > 0 ? layerColors[activeLayer] : 'muted';
      const pulsing = activeLayer === 'alertas' && count >= 2;
      return {
        id: b.nombre,
        lat: b.centro_lat,
        lng: b.centro_lng,
        label: b.nombre,
        sublabel: `${count} ${activeLayer}`,
        color,
        count,
        pulsing,
        polygon: b.poligono,
      };
    });
  }, [barrios, barrioCounts, activeLayer, layerColors]);

  const layers = [
    { key: 'juntas' as LayerType, label: 'Todas las Juntas', icon: Building2, color: 'bg-primary' },
    { key: 'alertas' as LayerType, label: 'Alertas', icon: AlertTriangle, color: 'bg-red-500' },
    { key: 'reportes' as LayerType, label: 'Reportes', icon: Camera, color: 'bg-accent' },
    { key: 'notas' as LayerType, label: 'Notas de Reclamo', icon: FileText, color: 'bg-amber-500' },
  ];

  const selectedBarrioData = selectedBarrio ? barrioCounts[selectedBarrio] : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight">
          <MapIcon className="h-6 w-6 text-primary" />
          Mapa Completo de La Banda
        </h1>
        <p className="text-muted-foreground">
          Vista administrativa con todas las juntas (activas y pendientes), alertas, reportes y reclamos.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Cargando mapa...</p>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <Layers className="h-4 w-4" />
              Capa:
            </span>
            {layers.map((layer) => {
              const Icon = layer.icon;
              return (
                <button
                  key={layer.key}
                  onClick={() => setActiveLayer(layer.key)}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                    activeLayer === layer.key
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border text-muted-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {layer.label}
                </button>
              );
            })}
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card className="overflow-hidden border-border/60">
                <div className="relative h-[500px] w-full">
                  <LeafletMap
                    center={LA_BANDA_CENTER}
                    markers={markers}
                    onMarkerClick={(id) => setSelectedBarrio(id)}
                    selectedId={selectedBarrio}
                  />
                </div>
                <div className="flex items-center gap-4 border-t border-border/60 p-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className={cn('h-3 w-3 rounded-full', layers.find(l => l.key === activeLayer)?.color)} />
                    Con datos
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-muted-foreground/30" />
                    Sin datos
                  </span>
                  <span className="ml-auto">Hacé clic en un marcador para ver detalles</span>
                </div>
              </Card>
            </div>

            <div className="space-y-4">
              {selectedBarrio && selectedBarrioData ? (
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      <h2 className="font-display text-lg font-bold text-foreground">{selectedBarrio}</h2>
                    </div>
                    <div className="mt-4 space-y-3">
                      <StatRow icon={Building2} label="Juntas activas" count={selectedBarrioData.juntas} color="text-primary" />
                      <StatRow icon={Building2} label="Juntas pendientes" count={selectedBarrioData.juntasInactivas} color="text-muted-foreground" />
                      <StatRow icon={AlertTriangle} label="Alertas" count={selectedBarrioData.alertas} color="text-red-600" />
                      <StatRow icon={Camera} label="Reportes" count={selectedBarrioData.reportes} color="text-accent" />
                      <StatRow icon={FileText} label="Notas de reclamo" count={selectedBarrioData.notas} color="text-amber-600" />
                    </div>

                    {juntas.filter((j) => j.barrio === selectedBarrio).length > 0 && (
                      <div className="mt-4 border-t border-border/40 pt-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Juntas</p>
                        {juntas.filter((j) => j.barrio === selectedBarrio).map((j) => (
                          <p key={j.id} className={cn('mt-1 text-sm font-medium', j.activa ? 'text-foreground' : 'text-muted-foreground')}>
                            {j.nombre} {!j.activa && '(pendiente)'}
                          </p>
                        ))}
                      </div>
                    )}

                    {alertas.filter((a) => a.barrio === selectedBarrio).length > 0 && (
                      <div className="mt-4 border-t border-border/40 pt-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Alertas</p>
                        {alertas.filter((a) => a.barrio === selectedBarrio).map((a) => {
                          const style = ALERTA_NIVEL_STYLES[a.nivel] || ALERTA_NIVEL_STYLES.Alta;
                          return (
                            <div key={a.id} className={cn('mt-1.5 rounded-md border-l-2 p-2', style.border, style.bg)}>
                              <p className="text-sm font-medium text-foreground">{a.titulo}</p>
                              <p className={cn('text-xs', style.color)}>{a.nivel}</p>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-3 w-full"
                      onClick={() => setSelectedBarrio(null)}
                    >
                      Cerrar detalles
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-muted/30">
                  <CardContent className="p-5 text-center">
                    <MapPin className="mx-auto h-8 w-8 text-muted-foreground/40" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Seleccioná un barrio para ver el detalle administrativo
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatRow({
  icon: Icon,
  label,
  count,
  color,
}: {
  icon: React.ElementType;
  label: string;
  count: number;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className={cn('h-4 w-4', color)} />
        {label}
      </span>
      <span className={cn('font-bold', count > 0 ? color : 'text-muted-foreground')}>{count}</span>
    </div>
  );
}
