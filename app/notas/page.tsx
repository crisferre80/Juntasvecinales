'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  MapPin,
  Eye,
  Clock,
  CheckCircle2,
  Printer,
  ArrowRight,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { NotaReclamo, Junta } from '@/lib/types';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/lib/format';
import { NOTA_ESTADO_STYLES, TIPOS_RECLAMO } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function NotasPage() {
  const [notas, setNotas] = useState<NotaReclamo[]>([]);
  const [juntas, setJuntas] = useState<Junta[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('all');

  useEffect(() => {
    async function load() {
      const [n, j] = await Promise.all([
        supabase.from('notas_reclamo').select('*').order('created_at', { ascending: false }),
        supabase.from('juntas').select('*'),
      ]);
      setNotas((n.data as NotaReclamo[]) || []);
      setJuntas((j.data as Junta[]) || []);
      setLoading(false);
    }
    load();
  }, []);

  const juntaMap = new Map(juntas.map((j) => [j.id, j]));

  const filtered = notas.filter((n) => {
    const q = search.toLowerCase();
    const matchSearch =
      n.asunto.toLowerCase().includes(q) ||
      n.tipo_reclamo.toLowerCase().includes(q) ||
      (n.barrio || '').toLowerCase().includes(q);
    const matchEstado = filterEstado === 'all' || n.estado === filterEstado;
    return matchSearch && matchEstado;
  });

  const counts = {
    Pendiente: notas.filter((n) => n.estado === 'Pendiente').length,
    'En revisión': notas.filter((n) => n.estado === 'En revisión').length,
    Solucionado: notas.filter((n) => n.estado === 'Solucionado').length,
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="flex items-center gap-2 font-display text-3xl font-bold tracking-tight text-foreground">
                <FileText className="h-7 w-7 text-primary" />
                Notas de Reclamo
              </h1>
              <p className="mt-1 text-muted-foreground">
                Generá notas oficiales dirigidas al Municipio de La Banda
              </p>
            </div>
            <Link href="/notas/nueva">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Generar Nueva Nota
              </Button>
            </Link>
          </div>

          {/* Status summary */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            {(
              [
                { label: 'Pendientes', count: counts.Pendiente, icon: Clock, style: NOTA_ESTADO_STYLES.Pendiente },
                { label: 'En revisión', count: counts['En revisión'], icon: Eye, style: NOTA_ESTADO_STYLES['En revisión'] },
                { label: 'Solucionados', count: counts.Solucionado, icon: CheckCircle2, style: NOTA_ESTADO_STYLES.Solucionado },
              ] as const
            ).map((s) => {
              const Icon = s.icon;
              return (
                <Card key={s.label} className={cn('border', s.style.bg)}>
                  <CardContent className="flex items-center gap-3 p-4">
                    <Icon className={cn('h-5 w-5', s.style.color)} />
                    <div>
                      <p className={cn('font-display text-xl font-bold', s.style.color)}>{s.count}</p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Filters */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar notas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setFilterEstado('all')}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                  filterEstado === 'all'
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border text-muted-foreground hover:bg-muted'
                )}
              >
                Todas
              </button>
              {(['Pendiente', 'En revisión', 'Solucionado'] as const).map((est) => (
                <button
                  key={est}
                  onClick={() => setFilterEstado(est)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                    filterEstado === est
                      ? 'border-primary bg-primary text-primary-foreground'
                      : cn(NOTA_ESTADO_STYLES[est].bg, NOTA_ESTADO_STYLES[est].color, 'hover:opacity-80')
                  )}
                >
                  {est}
                </button>
              ))}
            </div>
          </div>

          {/* Notes list */}
          <div className="mt-6 space-y-3">
            {loading ? (
              <p className="py-12 text-center text-sm text-muted-foreground">Cargando notas...</p>
            ) : filtered.length > 0 ? (
              filtered.map((nota) => {
                const style = NOTA_ESTADO_STYLES[nota.estado] || NOTA_ESTADO_STYLES.Pendiente;
                const junta = nota.junta_id ? juntaMap.get(nota.junta_id) : null;
                return (
                  <Link key={nota.id} href={`/notas/${nota.id}`}>
                    <Card className="group cursor-pointer border-border/60 transition-all hover:shadow-md hover:border-primary/30">
                      <CardContent className="flex items-center justify-between gap-3 p-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                              {nota.tipo_reclamo}
                            </span>
                            <span className={cn('flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium', style.bg, style.color)}>
                              <span className={cn('h-1.5 w-1.5 rounded-full', style.dot)} />
                              {nota.estado}
                            </span>
                          </div>
                          <h3 className="mt-1.5 font-semibold text-foreground group-hover:text-primary">
                            {nota.asunto}
                          </h3>
                          <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
                            {nota.detalle}
                          </p>
                          <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span>{formatDate(nota.fecha_reclamo)}</span>
                            {nota.barrio && (
                              <span className="flex items-center gap-0.5">
                                <MapPin className="h-3 w-3" />
                                {nota.barrio}
                              </span>
                            )}
                            {junta && <span>{junta.nombre}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link href={`/notas/${nota.id}`}>
                            <Button variant="ghost" size="sm" className="gap-1">
                              <Printer className="h-3.5 w-3.5" />
                              Ver / Imprimir
                            </Button>
                          </Link>
                          <ArrowRight className="h-4 w-4 text-muted-foreground/50 transition-transform group-hover:translate-x-1" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })
            ) : (
              <div className="py-12 text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground/30" />
                <p className="mt-3 text-sm text-muted-foreground">
                  {search || filterEstado !== 'all' ? 'No se encontraron notas.' : 'Aún no hay notas de reclamo.'}
                </p>
                {!search && filterEstado === 'all' && (
                  <Link href="/notas/nueva">
                    <Button className="mt-4 gap-2">
                      <Plus className="h-4 w-4" />
                      Generar primera nota
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
