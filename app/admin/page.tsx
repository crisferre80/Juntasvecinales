'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  FileText,
  Camera,
  MessageSquare,
  AlertTriangle,
  Vote,
  TrendingUp,
  Clock,
  CheckCircle2,
  Eye,
} from 'lucide-react';

interface AdminStats {
  juntasPendientes: number;
  juntasTotal: number;
  notasPendientes: number;
  notasRevision: number;
  notasSolucionadas: number;
  reportesDetectada: number;
  reportesGestion: number;
  reportesRealizada: number;
  foroPosts: number;
  alertasActivas: number;
  encuestasActivas: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [
        juntas,
        notas,
        reportes,
        foroPosts,
        alertas,
        encuestas,
      ] = await Promise.all([
        supabase.from('juntas').select('activa'),
        supabase.from('notas_reclamo').select('estado'),
        supabase.from('reportes_foto').select('estado'),
        supabase.from('foro_posts').select('id', { count: 'exact', head: true }),
        supabase.from('alertas').select('activa'),
        supabase.from('encuestas').select('activa,cerrada'),
      ]);

      const juntasData = (juntas.data ?? []) as { activa: boolean }[];
      const notasData = (notas.data ?? []) as { estado: string }[];
      const reportesData = (reportes.data ?? []) as { estado: string }[];
      const alertasData = (alertas.data ?? []) as { activa: boolean }[];
      const encuestasData = (encuestas.data ?? []) as { activa: boolean; cerrada: boolean }[];

      setStats({
        juntasPendientes: juntasData.filter((j) => !j.activa).length,
        juntasTotal: juntasData.length,
        notasPendientes: notasData.filter((n) => n.estado === 'Pendiente').length,
        notasRevision: notasData.filter((n) => n.estado === 'En revisión').length,
        notasSolucionadas: notasData.filter((n) => n.estado === 'Solucionado').length,
        reportesDetectada: reportesData.filter((r) => r.estado === 'Problemática detectada').length,
        reportesGestion: reportesData.filter((r) => r.estado === 'En gestión').length,
        reportesRealizada: reportesData.filter((r) => r.estado === 'Obra realizada').length,
        foroPosts: foroPosts.count ?? 0,
        alertasActivas: alertasData.filter((a) => a.activa).length,
        encuestasActivas: encuestasData.filter((e) => e.activa && !e.cerrada).length,
      });
      setLoading(false);
    }
    load();
  }, []);

  const StatCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    href,
  }: {
    title: string;
    value: number | string;
    subtitle?: string;
    icon: React.ElementType;
    href: string;
  }) => (
    <Link href={href}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className="mt-1 font-display text-3xl font-bold">{loading ? '–' : value}</p>
              {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Panel de Administración</h1>
        <p className="text-muted-foreground">
          Gestión centralizada de juntas vecinales, reclamos, reportes y foro.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Juntas pendientes"
          value={stats?.juntasPendientes ?? 0}
          subtitle={`de ${stats?.juntasTotal ?? 0} totales`}
          icon={Users}
          href="/admin/juntas"
        />
        <StatCard
          title="Reclamos pendientes"
          value={stats?.notasPendientes ?? 0}
          icon={FileText}
          href="/admin/notas"
        />
        <StatCard
          title="Reportes activos"
          value={stats?.reportesDetectada ?? 0}
          icon={Camera}
          href="/admin/reportes"
        />
        <StatCard
          title="Publicaciones en foro"
          value={stats?.foroPosts ?? 0}
          icon={MessageSquare}
          href="/admin/foro"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              Estado de Reclamos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <StatusRow icon={Clock} label="Pendientes" count={stats?.notasPendientes ?? 0} color="text-amber-600" />
            <StatusRow icon={Eye} label="En revisión" count={stats?.notasRevision ?? 0} color="text-blue-600" />
            <StatusRow icon={CheckCircle2} label="Solucionados" count={stats?.notasSolucionadas ?? 0} color="text-emerald-600" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Camera className="h-4 w-4 text-primary" />
              Estado de Reportes Fotográficos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <StatusRow icon={AlertTriangle} label="Problemática detectada" count={stats?.reportesDetectada ?? 0} color="text-red-600" />
            <StatusRow icon={TrendingUp} label="En gestión" count={stats?.reportesGestion ?? 0} color="text-amber-600" />
            <StatusRow icon={CheckCircle2} label="Obra realizada" count={stats?.reportesRealizada ?? 0} color="text-emerald-600" />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Badge variant="secondary" className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          {stats?.alertasActivas ?? 0} alertas activas
        </Badge>
        <Badge variant="secondary" className="gap-1">
          <Vote className="h-3 w-3" />
          {stats?.encuestasActivas ?? 0} encuestas activas
        </Badge>
      </div>
    </div>
  );
}

function StatusRow({
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
        <Icon className="h-4 w-4" />
        {label}
      </span>
      <span className={`font-semibold ${color}`}>{count}</span>
    </div>
  );
}
