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
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
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

export default function MapaPage() {
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
        supabase.from('alertas').select('*').eq('activa', true),
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
    const counts: Record<string, { juntas: number; alertas: number; reportes: number; notas: number }> = {};
    barrios.forEach((b) => {
      counts[b.nombre] = { juntas: 0, alertas: 0, reportes: 0, notas: 0 };
    });
    juntas.forEach((j) => {
      if (counts[j.barrio]) counts[j.barrio].juntas++;
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
      const color = count > 0
        ? layerColors[activeLayer]
        : 'muted';
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

  const layers: { key: LayerType; label: string; icon: React.ElementType; color: string }[] = [
    { key: 'juntas', label: 'Juntas Activas', icon: Building2, color: 'bg-primary' },
    { key: 'alertas', label: 'Alertas', icon: AlertTriangle, color: 'bg-red-500' },
    { key: 'reportes', label: 'Reportes', icon: Camera, color: 'bg-accent' },
    { key: 'notas', label: 'Notas de Reclamo', icon: FileText, color: 'bg-amber-500' },
  ];

  const selectedBarrioData = selectedBarrio ? barrioCounts[selectedBarrio] : null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
          <div>
            <h1 className="flex items-center gap-2 font-display text-3xl font-bold tracking-tight text-foreground">
              <MapIcon className="h-7 w-7 text-primary" />
              Mapa Interactivo de La Banda
            </h1>
            <p className="mt-1 text-muted-foreground">
              Barrios marcados según juntas activas, alertas, reportes y notas de reclamo
            </p>
          </div>

          {/* Layer switcher */}
          <div className="mt-6 flex flex-wrap items-center gap-2">
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

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {/* Map */}
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

                {/* Legend */}
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

            {/* Sidebar: barrio details */}
            <div className="space-y-4">
              {selectedBarrio && selectedBarrioData ? (
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      <h2 className="font-display text-lg font-bold text-foreground">{selectedBarrio}</h2>
                    </div>
                    <div className="mt-4 space-y-3">
                      <StatRow icon={Building2} label="Juntas vecinales" count={selectedBarrioData.juntas} color="text-primary" />
                      <StatRow icon={AlertTriangle} label="Alertas activas" count={selectedBarrioData.alertas} color="text-red-600" />
                      <StatRow icon={Camera} label="Reportes fotográficos" count={selectedBarrioData.reportes} color="text-accent" />
                      <StatRow icon={FileText} label="Notas de reclamo" count={selectedBarrioData.notas} color="text-amber-600" />
                    </div>

                    {juntas.filter((j) => j.barrio === selectedBarrio).length > 0 && (
                      <div className="mt-4 border-t border-border/40 pt-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Juntas</p>
                        {juntas.filter((j) => j.barrio === selectedBarrio).map((j) => (
                          <p key={j.id} className="mt-1 text-sm font-medium text-foreground">{j.nombre}</p>
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
                      Seleccioná un barrio en el mapa para ver sus detalles
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Summary */}
              <Card>
                <CardContent className="p-5">
                  <h3 className="font-display text-sm font-bold text-foreground">Resumen General</h3>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Barrios con juntas</span>
                      <span className="font-bold text-foreground">
                        {Object.values(barrioCounts).filter((c) => c.juntas > 0).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Barrios con alertas</span>
                      <span className="font-bold text-foreground">
                        {Object.values(barrioCounts).filter((c) => c.alertas > 0).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Barrios con reportes</span>
                      <span className="font-bold text-foreground">
                        {Object.values(barrioCounts).filter((c) => c.reportes > 0).length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
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
