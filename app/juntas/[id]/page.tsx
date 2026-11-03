'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Users,
  FileText,
  Camera,
  Building2,
  IdCard,
  Home,
  Trash2,
  Plus,
  Pencil,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Junta, Miembro, NotaReclamo, ReporteFoto } from '@/lib/types';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/format';
import { NOTA_ESTADO_STYLES, REPORTE_ESTADO_STYLES } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function JuntaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [junta, setJunta] = useState<Junta | null>(null);
  const [miembros, setMiembros] = useState<Miembro[]>([]);
  const [notas, setNotas] = useState<NotaReclamo[]>([]);
  const [reportes, setReportes] = useState<ReporteFoto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    async function load() {
      const [j, m, n, r] = await Promise.all([
        supabase.from('juntas').select('*').eq('id', id).maybeSingle(),
        supabase.from('miembros').select('*').eq('junta_id', id).order('created_at'),
        supabase.from('notas_reclamo').select('*').eq('junta_id', id).order('created_at', { ascending: false }),
        supabase.from('reportes_foto').select('*').eq('junta_id', id).order('created_at', { ascending: false }),
      ]);
      if (j.data) setJunta(j.data as Junta);
      setMiembros((m.data as Miembro[]) || []);
      setNotas((n.data as NotaReclamo[]) || []);
      setReportes((r.data as ReporteFoto[]) || []);
      setLoading(false);
    }
    load();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('¿Eliminar esta junta vecinal? Se borrarán todos sus datos, miembros, notas y reportes asociados.')) return;
    const { error } = await supabase.from('juntas').delete().eq('id', id);
    if (error) {
      toast.error('Error al eliminar', { description: error.message });
    } else {
      toast.success('Junta eliminada');
      router.push('/juntas');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Cargando...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!junta) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground/30" />
            <p className="mt-3 text-muted-foreground">No se encontró la junta vecinal.</p>
            <Link href="/juntas" className="mt-4 inline-block">
              <Button variant="outline">Volver a juntas</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-8 lg:px-6">
          <Link href="/juntas" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Volver a juntas
          </Link>

          {/* Header */}
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-sm">
                <Building2 className="h-7 w-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {junta.nombre}
                  </h1>
                  {junta.activa ? (
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Activa</Badge>
                  ) : (
                    <Badge variant="secondary">Inactiva</Badge>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {junta.barrio}
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-2 text-destructive hover:text-destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
              Eliminar
            </Button>
          </div>

          {/* Info Cards */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Delimitación</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{junta.delimitacion_calles}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Presidente / Contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-medium text-foreground">{junta.presidente_nombre}</p>
                {junta.presidente_telefono && (
                  <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    {junta.presidente_telefono}
                  </p>
                )}
                {junta.presidente_email && (
                  <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    {junta.presidente_email}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {junta.descripcion && (
            <Card className="mt-4">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">{junta.descripcion}</p>
              </CardContent>
            </Card>
          )}

          {/* Stats Row */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="rounded-lg border border-border/60 p-4 text-center">
              <Users className="mx-auto h-5 w-5 text-blue-600" />
              <p className="mt-1 font-display text-xl font-bold text-foreground">{miembros.length}</p>
              <p className="text-xs text-muted-foreground">Miembros</p>
            </div>
            <div className="rounded-lg border border-border/60 p-4 text-center">
              <FileText className="mx-auto h-5 w-5 text-amber-600" />
              <p className="mt-1 font-display text-xl font-bold text-foreground">{notas.length}</p>
              <p className="text-xs text-muted-foreground">Notas</p>
            </div>
            <div className="rounded-lg border border-border/60 p-4 text-center">
              <Camera className="mx-auto h-5 w-5 text-accent" />
              <p className="mt-1 font-display text-xl font-bold text-foreground">{reportes.length}</p>
              <p className="text-xs text-muted-foreground">Reportes</p>
            </div>
          </div>

          {/* Members Table */}
          <div className="mt-8">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
              <Users className="h-5 w-5 text-primary" />
              Miembros Fundadores
            </h2>
            <div className="mt-4 overflow-hidden rounded-lg border border-border/60">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-muted/30">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nombre</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">DNI</th>
                      <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground sm:table-cell">Dirección</th>
                      <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">Teléfono</th>
                    </tr>
                  </thead>
                  <tbody>
                    {miembros.map((m) => (
                      <tr key={m.id} className="border-b border-border/40 last:border-0">
                        <td className="px-4 py-3 font-medium text-foreground">{m.nombre}</td>
                        <td className="px-4 py-3 text-muted-foreground">{m.dni}</td>
                        <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">{m.direccion}</td>
                        <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{m.telefono || '–'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Recent Notas */}
          {notas.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
                  <FileText className="h-5 w-5 text-amber-600" />
                  Notas de Reclamo
                </h2>
                <Link href="/notas">
                  <Button variant="ghost" size="sm">Ver todas</Button>
                </Link>
              </div>
              <div className="mt-4 space-y-2">
                {notas.slice(0, 4).map((nota) => {
                  const style = NOTA_ESTADO_STYLES[nota.estado] || NOTA_ESTADO_STYLES.Pendiente;
                  return (
                    <Link
                      key={nota.id}
                      href={`/notas/${nota.id}`}
                      className="block rounded-lg border border-border/60 p-3 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">{nota.asunto}</p>
                          <p className="text-xs text-muted-foreground">{nota.tipo_reclamo} · {formatDate(nota.fecha_reclamo)}</p>
                        </div>
                        <span className={cn('rounded-full border px-2 py-0.5 text-xs font-medium', style.bg, style.color)}>
                          {nota.estado}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Reportes */}
          {reportes.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
                  <Camera className="h-5 w-5 text-accent" />
                  Reportes Fotográficos
                </h2>
                <Link href="/reportes">
                  <Button variant="ghost" size="sm">Ver galería</Button>
                </Link>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {reportes.slice(0, 4).map((r) => {
                  const style = REPORTE_ESTADO_STYLES[r.estado] || REPORTE_ESTADO_STYLES['Problemática detectada'];
                  return (
                    <Link
                      key={r.id}
                      href="/reportes"
                      className="group overflow-hidden rounded-lg border border-border/60 transition-shadow hover:shadow-md"
                    >
                      <div className="relative aspect-square overflow-hidden bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={r.imagen_url} alt={r.titulo} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                          <p className="text-xs font-medium text-white">{r.titulo}</p>
                        </div>
                      </div>
                      <div className="p-2">
                        <span className={cn('inline-block rounded-full px-2 py-0.5 text-xs font-medium', style.bg, style.color)}>
                          {r.estado}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Link href="/notas/nueva">
              <Button variant="outline" className="w-full gap-2">
                <FileText className="h-4 w-4" />
                Generar Nota de Reclamo
              </Button>
            </Link>
            <Link href="/reportes/nuevo">
              <Button variant="outline" className="w-full gap-2">
                <Camera className="h-4 w-4" />
                Subir Reporte Foto
              </Button>
            </Link>
            <Link href="/foro/nuevo">
              <Button variant="outline" className="w-full gap-2">
                <Plus className="h-4 w-4" />
                Publicar en Foro
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
