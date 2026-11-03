'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Users,
  MessageSquare,
  FileText,
  Camera,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  Eye,
  MapPin,
  Vote,
  Building2,
  Activity,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  Junta,
  ForoPost,
  NotaReclamo,
  ReporteFoto,
  Alerta,
  Encuesta,
} from '@/lib/types';
import { formatTimeAgo, formatDate } from '@/lib/format';
import {
  FORO_CATEGORIA_STYLES,
  NOTA_ESTADO_STYLES,
  ALERTA_NIVEL_STYLES,
} from '@/lib/constants';
import { useAuth } from '@/lib/auth-context';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DashboardData {
  juntas: Junta[];
  foroPosts: ForoPost[];
  notas: NotaReclamo[];
  reportes: ReporteFoto[];
  alertas: Alerta[];
  encuestas: Encuesta[];
}

export default function HomePage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function load() {
      const [juntas, foroPosts, notas, reportes, alertas, encuestas] =
        await Promise.all([
          supabase
            .from('juntas')
            .select('*')
            .order('created_at', { ascending: false }),
          supabase
            .from('foro_posts')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5),
          supabase
            .from('notas_reclamo')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5),
          supabase
            .from('reportes_foto')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(4),
          supabase
            .from('alertas')
            .select('*')
            .eq('activa', true)
            .order('created_at', { ascending: false }),
          supabase
            .from('encuestas')
            .select('*')
            .eq('activa', true)
            .order('created_at', { ascending: false })
            .limit(3),
        ]);

      setData({
        juntas: juntas.data || [],
        foroPosts: foroPosts.data || [],
        notas: notas.data || [],
        reportes: reportes.data || [],
        alertas: alertas.data || [],
        encuestas: encuestas.data || [],
      });
      setLoading(false);
    }
    load();
  }, []);

  const stats = [
    {
      label: 'Juntas Activas',
      value: data?.juntas.filter((j) => j.activa).length ?? 0,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      href: '/juntas',
    },
    {
      label: 'Publicaciones',
      value: data?.foroPosts.length ?? 0,
      icon: MessageSquare,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      href: '/foro',
    },
    {
      label: 'Notas de Reclamo',
      value: data?.notas.length ?? 0,
      icon: FileText,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      href: '/notas',
    },
    {
      label: 'Reportes Fotográficos',
      value: data?.reportes.length ?? 0,
      icon: Camera,
      color: 'text-accent',
      bg: 'bg-accent/10',
      href: '/reportes',
    },
  ];

  const notasPendientes = data?.notas.filter(
    (n) => n.estado === 'Pendiente'
  ).length ?? 0;
  const notasEnRevision = data?.notas.filter(
    (n) => n.estado === 'En revisión'
  ).length ?? 0;
  const notasSolucionadas = data?.notas.filter(
    (n) => n.estado === 'Solucionado'
  ).length ?? 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section
          className="relative overflow-hidden border-b border-border"
        >
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40 blur-[2px]"
            style={{ backgroundImage: 'url(/images/obras_procrear_la_banda_01.jpg)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/80" />
          <div className="relative mx-auto max-w-7xl px-4 py-10 lg:px-6 lg:py-18">
            <div className="flex flex-col items-start gap-5">
              <Badge className="gap-1.5 border-white/25 bg-white/15 text-white shadow-sm backdrop-blur-sm">
                <MapPin className="h-3 w-3" />
                La Banda, Santiago del Estero
              </Badge>
              <div className="flex items-center gap-4 sm:gap-5 lg:gap-6">
                <div className="h-16 w-16 shrink-0 overflow-hidden sm:h-20 sm:w-20 lg:h-48 lg:w-48">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/escudo_la_banda.png"
                    alt="Escudo de La Banda"
                    className="h-full w-full object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
                  />
                </div>
                <h1 className="max-w-3xl font-display text-5xl font-bold tracking-tight text-balance text-white sm:text-6xl lg:text-7xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                  Juntas Vecinales de La Banda
                </h1>
              </div>
              <p className="max-w-2xl text-lg text-white/90 text-balance drop-shadow-md">
                Plataforma de gestión vecinal para organizar tu junta, dialogar
                con otros barrios, generar notas oficiales de reclamo y hacer
                seguimiento a las gestiones ante el municipio.
              </p>
              <div className="flex flex-wrap gap-3">
                {user ? (
                  <>
                    <Link href="/juntas/nueva">
                      <Button size="lg" className="gap-2 shadow-lg">
                        <Users className="h-4 w-4" />
                        Crear Junta Vecinal
                      </Button>
                    </Link>
                    <Link href="/foro">
                      <Button size="lg" variant="outline" className="gap-2 border-white/30 bg-white/10 text-white shadow-lg hover:bg-white/20 hover:text-white">
                        <MessageSquare className="h-4 w-4" />
                        Ir al Foro
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/login">
                      <Button size="lg" className="gap-2 shadow-lg">
                        <Users className="h-4 w-4" />
                        Ingresar para participar
                      </Button>
                    </Link>
                    <Link href="/registro">
                      <Button size="lg" variant="outline" className="gap-2 border-white/30 bg-white/10 text-white shadow-lg hover:bg-white/20 hover:text-white">
                        Crear cuenta vecinal
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Stats Cards */}
        <section className="mx-auto max-w-7xl px-4 pt-6 lg:px-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Link key={stat.label} href={stat.href}>
                  <Card className="group cursor-pointer border-border/60 transition-shadow hover:shadow-md">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div
                          className={cn(
                            'flex h-10 w-10 items-center justify-center rounded-lg',
                            stat.bg
                          )}
                        >
                          <Icon className={cn('h-5 w-5', stat.color)} />
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground/50 transition-transform group-hover:translate-x-1" />
                      </div>
                      <p className="mt-3 font-display text-2xl font-bold text-foreground">
                        {loading ? '–' : stat.value}
                      </p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Priority Alerts */}
        {data && data.alertas.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 pt-10 lg:px-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h2 className="font-display text-lg font-bold text-foreground">
                Alertas Prioritarias Activas
              </h2>
              <Badge variant="destructive" className="ml-1">
                {data.alertas.length}
              </Badge>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data.alertas.slice(0, 3).map((alerta) => {
                const style = ALERTA_NIVEL_STYLES[alerta.nivel] || ALERTA_NIVEL_STYLES.Alta;
                return (
                  <Card
                    key={alerta.id}
                    className={cn('border-l-4', style.border, style.bg)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={cn('animate-pulse-ring flex h-2.5 w-2.5 rounded-full', alerta.nivel === 'Crítica' ? 'bg-red-500' : 'bg-orange-500')} />
                          <span className={cn('text-xs font-bold uppercase tracking-wide', style.color)}>
                            {alerta.nivel}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(alerta.created_at)}
                        </span>
                      </div>
                      <h3 className="mt-2 font-semibold text-foreground">{alerta.titulo}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {alerta.descripcion}
                      </p>
                      <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {alerta.barrio}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Main Content Grid */}
        <section className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Recent Forum Posts */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Actividad Reciente del Foro
                  </CardTitle>
                  <Link href="/foro">
                    <Button variant="ghost" size="sm" className="gap-1">
                      Ver todo <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent className="space-y-3">
                  {loading ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      Cargando publicaciones...
                    </p>
                  ) : data && data.foroPosts.length > 0 ? (
                    data.foroPosts.map((post) => {
                      const catStyle = FORO_CATEGORIA_STYLES[post.categoria] || FORO_CATEGORIA_STYLES.Problemática;
                      return (
                        <Link
                          key={post.id}
                          href={`/foro/${post.id}`}
                          className="block rounded-lg border border-border/60 p-3 transition-colors hover:bg-muted/50"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className={cn('rounded-full border px-2 py-0.5 text-xs font-medium', catStyle.bg, catStyle.color)}>
                                  {catStyle.label}
                                </span>
                                {post.prioridad && (
                                  <Badge variant="destructive" className="px-1.5 text-xs">
                                    Prioridad
                                  </Badge>
                                )}
                              </div>
                              <h3 className="mt-1.5 font-semibold text-foreground">
                                {post.titulo}
                              </h3>
                              <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
                                {post.contenido}
                              </p>
                              <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                                <span>Por {post.autor_nombre}</span>
                                {post.barrio && (
                                  <span className="flex items-center gap-0.5">
                                    <MapPin className="h-3 w-3" />
                                    {post.barrio}
                                  </span>
                                )}
                                <span>{formatTimeAgo(post.created_at)}</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })
                  ) : (
                    <div className="py-8 text-center">
                      <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground/40" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Aún no hay publicaciones en el foro.
                      </p>
                      <Link href="/foro/nuevo">
                        <Button variant="outline" size="sm" className="mt-3">
                          Crear primera publicación
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar: Note Status + Polls */}
            <div className="space-y-6">
              {/* Municipal Dashboard */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Estado de Notas al Municipio
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <StatusRow
                    icon={Clock}
                    label="Pendientes"
                    count={notasPendientes}
                    total={data?.notas.length ?? 0}
                    color="bg-amber-500"
                    textColor="text-amber-700"
                  />
                  <StatusRow
                    icon={Eye}
                    label="En revisión"
                    count={notasEnRevision}
                    total={data?.notas.length ?? 0}
                    color="bg-blue-500"
                    textColor="text-blue-700"
                  />
                  <StatusRow
                    icon={CheckCircle2}
                    label="Solucionadas"
                    count={notasSolucionadas}
                    total={data?.notas.length ?? 0}
                    color="bg-emerald-500"
                    textColor="text-emerald-700"
                  />
                  <Link href="/notas">
                    <Button variant="outline" size="sm" className="mt-2 w-full">
                      Ver todas las notas
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Active Polls */}
              {data && data.encuestas.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Vote className="h-4 w-4 text-accent" />
                      Encuestas Activas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {data.encuestas.map((enc) => (
                      <Link
                        key={enc.id}
                        href="/encuestas"
                        className="block rounded-lg border border-border/60 p-3 transition-colors hover:bg-muted/50"
                      >
                        <p className="text-sm font-medium text-foreground">
                          {enc.pregunta}
                        </p>
                        {enc.barrio && (
                          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {enc.barrio}
                          </p>
                        )}
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Quick Links */}
              <Card className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                <CardContent className="p-5">
                  <Building2 className="h-8 w-8 opacity-80" />
                  <h3 className="mt-3 font-display text-lg font-bold">
                    ¿Tu barrio aún no tiene junta?
                  </h3>
                  <p className="mt-1 text-sm text-primary-foreground/80">
                    Registrá tu Junta Vecinal y empezá a gestionar los reclamos
                    de tu barrio.
                  </p>
                  <Link href="/juntas/nueva">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mt-3 w-full bg-white text-primary hover:bg-white/90"
                    >
                      Registrar Junta Vecinal
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Photo Gallery Preview */}
        {data && data.reportes.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 pb-10 lg:px-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-foreground">
                Reportes Fotográficos Recientes
              </h2>
              <Link href="/reportes">
                <Button variant="ghost" size="sm" className="gap-1">
                  Ver galería <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
              {data.reportes.map((reporte) => (
                <Link
                  key={reporte.id}
                  href="/reportes"
                  className="group overflow-hidden rounded-lg border border-border/60 transition-shadow hover:shadow-md"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={reporte.imagen_url}
                      alt={reporte.titulo}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                      <p className="text-xs font-medium text-white">
                        {reporte.titulo}
                      </p>
                      <p className="text-xs text-white/80">
                        {reporte.barrio} · {formatDate(reporte.fecha_captura)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}

function StatusRow({
  icon: Icon,
  label,
  count,
  total,
  color,
  textColor,
}: {
  icon: React.ElementType;
  label: string;
  count: number;
  total: number;
  color: string;
  textColor: string;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Icon className="h-3.5 w-3.5" />
          {label}
        </span>
        <span className={cn('font-semibold', textColor)}>{count}</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn('h-full rounded-full transition-all', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
