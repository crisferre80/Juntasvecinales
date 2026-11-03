'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Users,
  Plus,
  MapPin,
  Phone,
  Mail,
  Search,
  Building2,
  ArrowRight,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Junta, JuntaWithCounts } from '@/lib/types';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';

export default function JuntasPage() {
  const [juntas, setJuntas] = useState<JuntaWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('juntas')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) {
        const withCounts = await Promise.all(
          (data as Junta[]).map(async (j) => {
            const [miembros, notas, reportes] = await Promise.all([
              supabase.from('miembros').select('id', { count: 'exact', head: true }).eq('junta_id', j.id),
              supabase.from('notas_reclamo').select('id', { count: 'exact', head: true }).eq('junta_id', j.id),
              supabase.from('reportes_foto').select('id', { count: 'exact', head: true }).eq('junta_id', j.id),
            ]);
            return {
              ...j,
              miembros_count: miembros.count || 0,
              notas_count: notas.count || 0,
              reportes_count: reportes.count || 0,
            };
          })
        );
        setJuntas(withCounts);
      }
      setLoading(false);
    }
    load();
  }, []);

  const filtered = juntas.filter((j) => {
    const q = search.toLowerCase();
    return (
      j.nombre.toLowerCase().includes(q) ||
      j.barrio.toLowerCase().includes(q) ||
      j.presidente_nombre.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
                Juntas Vecinales
              </h1>
              <p className="mt-1 text-muted-foreground">
                {juntas.length} {juntas.length === 1 ? 'junta registrada' : 'juntas registradas'} en La Banda
              </p>
            </div>
            <Link href="/juntas/nueva">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Registrar Nueva Junta
              </Button>
            </Link>
          </div>

          {/* Search */}
          <div className="relative mt-6 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, barrio o presidente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Grid */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <p className="col-span-full py-12 text-center text-sm text-muted-foreground">
                Cargando juntas...
              </p>
            ) : filtered.length > 0 ? (
              filtered.map((junta) => (
                <Link key={junta.id} href={`/juntas/${junta.id}`}>
                  <Card className="group h-full cursor-pointer border-border/60 transition-all hover:shadow-md hover:border-primary/30">
                    <CardHeader className="flex-row items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base leading-tight">
                            {junta.nombre}
                          </CardTitle>
                          <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            {junta.barrio}
                          </div>
                        </div>
                      </div>
                      {junta.activa ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Activa</Badge>
                      ) : (
                        <Badge variant="secondary">Inactiva</Badge>
                      )}
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Presidente:</span>{' '}
                        {junta.presidente_nombre}
                      </p>
                      <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                        Delimitación: {junta.delimitacion_calles}
                      </p>
                      <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {junta.miembros_count} miembros
                        </span>
                        <span>· {junta.notas_count} notas</span>
                        <span>· {junta.reportes_count} reportes</span>
                      </div>
                      <div className="mt-3 flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                        Ver detalles <ArrowRight className="h-3 w-3" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="col-span-full py-12 text-center">
                <Building2 className="mx-auto h-12 w-12 text-muted-foreground/30" />
                <p className="mt-3 text-sm text-muted-foreground">
                  {search ? 'No se encontraron juntas con ese criterio.' : 'Aún no hay juntas registradas.'}
                </p>
                {!search && (
                  <Link href="/juntas/nueva">
                    <Button className="mt-4 gap-2">
                      <Plus className="h-4 w-4" />
                      Registrar la primera junta
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
