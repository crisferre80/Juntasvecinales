'use client';

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  AlertTriangle,
  Plus,
  MapPin,
  Trash2,
  Bell,
  BellOff,
  X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Alerta, Junta } from '@/lib/types';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { formatTimeAgo } from '@/lib/format';
import { BARRIOS_LA_BANDA, ALERTA_NIVELES, ALERTA_NIVEL_STYLES } from '@/lib/constants';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';

export default function AlertasPage() {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [juntas, setJuntas] = useState<Junta[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { isAdmin } = useAuth();
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [barrio, setBarrio] = useState('');
  const [nivel, setNivel] = useState('Alta');
  const [juntaId, setJuntaId] = useState('');

  const loadData = useCallback(async () => {
    const [a, j] = await Promise.all([
      supabase.from('alertas').select('*').order('created_at', { ascending: false }),
      supabase.from('juntas').select('*'),
    ]);
    setAlertas((a.data as Alerta[]) || []);
    setJuntas((j.data as Junta[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !descripcion.trim() || !barrio) {
      toast.error('Faltan campos obligatorios');
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from('alertas').insert({
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        barrio,
        nivel,
        junta_id: juntaId || null,
        activa: true,
      });
      if (error) throw error;
      toast.success('Alerta creada');
      setDialogOpen(false);
      setTitulo('');
      setDescripcion('');
      setBarrio('');
      setNivel('Alta');
      setJuntaId('');
      loadData();
    } catch (err) {
      toast.error('Error al crear alerta', {
        description: err instanceof Error ? err.message : 'Intentalo nuevamente.',
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleActiva = async (alerta: Alerta) => {
    const { error } = await supabase
      .from('alertas')
      .update({ activa: !alerta.activa })
      .eq('id', alerta.id);
    if (error) {
      toast.error('Error al actualizar');
    } else {
      loadData();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta alerta?')) return;
    const { error } = await supabase.from('alertas').delete().eq('id', id);
    if (error) {
      toast.error('Error al eliminar');
    } else {
      toast.success('Alerta eliminada');
      loadData();
    }
  };

  const activeAlertas = alertas.filter((a) => a.activa);
  const inactiveAlertas = alertas.filter((a) => !a.activa);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-8 lg:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="flex items-center gap-2 font-display text-3xl font-bold tracking-tight text-foreground">
                <AlertTriangle className="h-7 w-7 text-red-600" />
                Alertas Prioritarias
              </h1>
              <p className="mt-1 text-muted-foreground">
                Urgencias comunitarias de los barrios de La Banda
              </p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              {isAdmin && (
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nueva Alerta
                  </Button>
                </DialogTrigger>
              )}
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Alerta Prioritaria</DialogTitle>
                  <DialogDescription>
                    Reportá una urgencia comunitaria para visibilizarla.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="alert-titulo">Título *</Label>
                    <Input
                      id="alert-titulo"
                      placeholder="Ej: Corte de agua en todo el barrio"
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="alert-desc">Descripción *</Label>
                    <Textarea
                      id="alert-desc"
                      placeholder="Detalle de la urgencia..."
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="alert-barrio">Barrio *</Label>
                      <Select value={barrio} onValueChange={setBarrio}>
                        <SelectTrigger id="alert-barrio">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          {BARRIOS_LA_BANDA.map((b) => (
                            <SelectItem key={b} value={b}>{b}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="alert-nivel">Nivel de urgencia</Label>
                      <Select value={nivel} onValueChange={setNivel}>
                        <SelectTrigger id="alert-nivel">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ALERTA_NIVELES.map((n) => (
                            <SelectItem key={n} value={n}>{n}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="alert-junta">Junta Vecinal (opcional)</Label>
                    <Select value={juntaId} onValueChange={setJuntaId}>
                      <SelectTrigger id="alert-junta">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {juntas.map((j) => (
                          <SelectItem key={j.id} value={j.id}>{j.nombre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={saving}>
                      {saving ? 'Creando...' : 'Crear Alerta'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Active alerts */}
          <div className="mt-6">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-red-600" />
              <h2 className="font-display text-lg font-bold text-foreground">Alertas Activas</h2>
              <Badge variant="destructive">{activeAlertas.length}</Badge>
            </div>

            <div className="mt-4 space-y-3">
              {loading ? (
                <p className="py-8 text-center text-sm text-muted-foreground">Cargando alertas...</p>
              ) : activeAlertas.length > 0 ? (
                activeAlertas.map((alerta) => {
                  const style = ALERTA_NIVEL_STYLES[alerta.nivel] || ALERTA_NIVEL_STYLES.Alta;
                  return (
                    <Card
                      key={alerta.id}
                      className={cn('border-l-4', style.border, style.bg)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className={cn('animate-pulse-ring flex h-2.5 w-2.5 rounded-full', alerta.nivel === 'Crítica' ? 'bg-red-500' : alerta.nivel === 'Alta' ? 'bg-orange-500' : 'bg-amber-500')} />
                              <span className={cn('text-xs font-bold uppercase tracking-wide', style.color)}>
                                {alerta.nivel}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatTimeAgo(alerta.created_at)}
                              </span>
                            </div>
                            <h3 className="mt-2 font-semibold text-foreground">{alerta.titulo}</h3>
                            <p className="mt-1 text-sm text-muted-foreground">{alerta.descripcion}</p>
                            <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {alerta.barrio}
                            </div>
                          </div>
                          {isAdmin && (
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => toggleActiva(alerta)}
                                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
                                title="Desactivar"
                              >
                                <BellOff className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(alerta.id)}
                                className="rounded-md p-1.5 text-muted-foreground hover:text-destructive"
                                title="Eliminar"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="py-8 text-center">
                  <Bell className="mx-auto h-10 w-10 text-muted-foreground/30" />
                  <p className="mt-2 text-sm text-muted-foreground">No hay alertas activas.</p>
                </div>
              )}
            </div>
          </div>

          {/* Inactive alerts */}
          {inactiveAlertas.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center gap-2">
                <BellOff className="h-5 w-5 text-muted-foreground" />
                <h2 className="font-display text-lg font-bold text-muted-foreground">Alertas Desactivadas</h2>
              </div>
              <div className="mt-4 space-y-2">
                {inactiveAlertas.map((alerta) => (
                  <Card key={alerta.id} className="opacity-60">
                    <CardContent className="flex items-center justify-between p-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{alerta.titulo}</p>
                        <p className="text-xs text-muted-foreground">{alerta.barrio} · {formatTimeAgo(alerta.created_at)}</p>
                      </div>
                      {isAdmin && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => toggleActiva(alerta)}
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
                            title="Reactivar"
                          >
                            <Bell className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(alerta.id)}
                            className="rounded-md p-1.5 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
