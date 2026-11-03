'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Camera,
  Plus,
  Search,
  MapPin,
  Calendar,
  Filter,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ReporteFoto, Junta } from '@/lib/types';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/lib/format';
import { REPORTE_ESTADOS, REPORTE_ESTADO_STYLES } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function ReportesPage() {
  const [reportes, setReportes] = useState<ReporteFoto[]>([]);
  const [juntas, setJuntas] = useState<Junta[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('all');

  useEffect(() => {
    async function load() {
      const [r, j] = await Promise.all([
        supabase.from('reportes_foto').select('*').order('created_at', { ascending: false }),
        supabase.from('juntas').select('*'),
      ]);
      setReportes((r.data as ReporteFoto[]) || []);
      setJuntas((j.data as Junta[]) || []);
      setLoading(false);
    }
    load();
  }, []);

  const juntaMap = new Map(juntas.map((j) => [j.id, j]));

  const filtered = reportes.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch =
      r.titulo.toLowerCase().includes(q) ||
      (r.descripcion || '').toLowerCase().includes(q) ||
      r.barrio.toLowerCase().includes(q);
    const matchEstado = filterEstado === 'all' || r.estado === filterEstado;
    return matchSearch && matchEstado;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="flex items-center gap-2 font-display text-3xl font-bold tracking-tight text-foreground">
                <Camera className="h-7 w-7 text-primary" />
                Galería de Reportes Fotográficos
              </h1>
              <p className="mt-1 text-muted-foreground">
                Obras y problemáticas de los barrios de La Banda
              </p>
            </div>
            <Link href="/reportes/nuevo">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Subir Reporte
              </Button>
            </Link>
          </div>

          {/* Filters */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar reportes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
              <Filter className="h-4 w-4 shrink-0 text-muted-foreground" />
              <button
                onClick={() => setFilterEstado('all')}
                className={cn(
                  'shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                  filterEstado === 'all'
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border text-muted-foreground hover:bg-muted'
                )}
              >
                Todos
              </button>
              {REPORTE_ESTADOS.map((est) => {
                const style = REPORTE_ESTADO_STYLES[est];
                return (
                  <button
                    key={est}
                    onClick={() => setFilterEstado(est)}
                    className={cn(
                      'shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                      filterEstado === est
                        ? 'border-primary bg-primary text-primary-foreground'
                        : cn(style.bg, style.color, 'hover:opacity-80')
                    )}
                  >
                    {est}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Gallery */}
          <div className="mt-6">
            {loading ? (
              <p className="py-12 text-center text-sm text-muted-foreground">Cargando reportes...</p>
            ) : filtered.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((r) => {
                  const style = REPORTE_ESTADO_STYLES[r.estado] || REPORTE_ESTADO_STYLES['Problemática detectada'];
                  const junta = r.junta_id ? juntaMap.get(r.junta_id) : null;
                  return (
                    <Card key={r.id} className="overflow-hidden border-border/60 transition-shadow hover:shadow-md">
                      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={r.imagen_url}
                          alt={r.titulo}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute right-2 top-2">
                          <span className={cn('rounded-full border px-2.5 py-0.5 text-xs font-medium backdrop-blur-sm', style.bg, style.color)}>
                            {r.estado}
                          </span>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-foreground">{r.titulo}</h3>
                        {r.descripcion && (
                          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{r.descripcion}</p>
                        )}
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {r.barrio}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(r.fecha_captura)}
                          </span>
                          {junta && <span>· {junta.nombre}</span>}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center">
                <Camera className="mx-auto h-12 w-12 text-muted-foreground/30" />
                <p className="mt-3 text-sm text-muted-foreground">
                  {search || filterEstado !== 'all' ? 'No se encontraron reportes.' : 'Aún no hay reportes fotográficos.'}
                </p>
                {!search && filterEstado === 'all' && (
                  <Link href="/reportes/nuevo">
                    <Button className="mt-4 gap-2">
                      <Plus className="h-4 w-4" />
                      Subir primer reporte
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
