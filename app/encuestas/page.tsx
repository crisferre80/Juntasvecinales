'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Vote,
  Plus,
  MapPin,
  Clock,
  CheckCircle2,
  BarChart3,
  Trash2,
  X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  Encuesta,
  EncuestaOpcion,
  EncuestaVoto,
  Junta,
  EncuestaWithRelations,
} from '@/lib/types';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { useBarrios } from '@/lib/use-barrios';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';

export default function EncuestasPage() {
  const { nombres: barrioNombres } = useBarrios();
  const [encuestas, setEncuestas] = useState<EncuestaWithRelations[]>([]);
  const [juntas, setJuntas] = useState<Junta[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newPregunta, setNewPregunta] = useState('');
  const [newBarrio, setNewBarrio] = useState('');
  const [newJuntaId, setNewJuntaId] = useState('');
  const [newOpciones, setNewOpciones] = useState<string[]>(['', '']);
  const [saving, setSaving] = useState(false);
  const { isAdmin } = useAuth();

  const loadData = useCallback(async () => {
    const [e, j] = await Promise.all([
      supabase
        .from('encuestas')
        .select('*')
        .order('created_at', { ascending: false }),
      supabase.from('juntas').select('*'),
    ]);

    const encuestasData = (e.data as Encuesta[]) || [];
    const encuestasWithOptions = await Promise.all(
      encuestasData.map(async (enc) => {
        const { data: opciones } = await supabase
          .from('encuesta_opciones')
          .select('*')
          .eq('encuesta_id', enc.id);

        const opcionesWithVotes = await Promise.all(
          ((opciones as EncuestaOpcion[]) || []).map(async (op) => {
            const { count } = await supabase
              .from('encuesta_votos')
              .select('id', { count: 'exact', head: true })
              .eq('opcion_id', op.id);
            return { ...op, voto_count: count || 0 };
          })
        );

        return { ...enc, encuesta_opciones: opcionesWithVotes };
      })
    );

    setEncuestas(encuestasWithOptions);
    setJuntas((j.data as Junta[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalVotes = (enc: EncuestaWithRelations) =>
    (enc.encuesta_opciones || []).reduce((sum, op) => sum + (op.voto_count || 0), 0);

  const handleVote = async (encuestaId: string, opcionId: string) => {
    const { error } = await supabase.from('encuesta_votos').insert({
      encuesta_id: encuestaId,
      opcion_id: opcionId,
      votante_nombre: null,
    });
    if (error) {
      toast.error('Error al registrar voto');
    } else {
      toast.success('Voto registrado');
      loadData();
    }
  };

  const handleClose = async (encuestaId: string) => {
    const { error } = await supabase
      .from('encuestas')
      .update({ cerrada: true, activa: false })
      .eq('id', encuestaId);
    if (error) {
      toast.error('Error al cerrar encuesta');
    } else {
      toast.success('Encuesta cerrada');
      loadData();
    }
  };

  const handleDelete = async (encuestaId: string) => {
    if (!confirm('¿Eliminar esta encuesta?')) return;
    const { error } = await supabase.from('encuestas').delete().eq('id', encuestaId);
    if (error) {
      toast.error('Error al eliminar');
    } else {
      toast.success('Encuesta eliminada');
      loadData();
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const opcionesValid = newOpciones.filter((o) => o.trim());
    if (!newPregunta.trim() || opcionesValid.length < 2) {
      toast.error('Faltan datos', {
        description: 'Ingresá una pregunta y al menos 2 opciones.',
      });
      return;
    }
    setSaving(true);
    try {
      const { data: enc, error: encError } = await supabase
        .from('encuestas')
        .insert({
          pregunta: newPregunta.trim(),
          barrio: newBarrio || null,
          junta_id: newJuntaId || null,
          activa: true,
          cerrada: false,
        })
        .select()
        .single();

      if (encError || !enc) throw encError;

      const { error: opError } = await supabase.from('encuesta_opciones').insert(
        opcionesValid.map((texto) => ({
          encuesta_id: enc.id,
          texto: texto.trim(),
        }))
      );

      if (opError) throw opError;

      toast.success('Encuesta creada');
      setDialogOpen(false);
      setNewPregunta('');
      setNewBarrio('');
      setNewJuntaId('');
      setNewOpciones(['', '']);
      loadData();
    } catch (err) {
      toast.error('Error al crear encuesta', {
        description: err instanceof Error ? err.message : 'Intentalo nuevamente.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-8 lg:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="flex items-center gap-2 font-display text-3xl font-bold tracking-tight text-foreground">
                <Vote className="h-7 w-7 text-primary" />
                Encuestas Vecinales
              </h1>
              <p className="mt-1 text-muted-foreground">
                Votá las prioridades del barrio antes de armar la nota al municipio
              </p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              {isAdmin && (
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nueva Encuesta
                  </Button>
                </DialogTrigger>
              )}
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Nueva Encuesta</DialogTitle>
                  <DialogDescription>
                    Plantear una pregunta y al menos 2 opciones de respuesta.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pregunta">Pregunta *</Label>
                    <Textarea
                      id="pregunta"
                      placeholder="Ej: ¿Cuál es la prioridad más urgente del barrio?"
                      value={newPregunta}
                      onChange={(e) => setNewPregunta(e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="enc-barrio">Barrio</Label>
                      <Select value={newBarrio} onValueChange={setNewBarrio}>
                        <SelectTrigger id="enc-barrio">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          {barrioNombres.map((b) => (
                            <SelectItem key={b} value={b}>{b}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="enc-junta">Junta (opcional)</Label>
                      <Select value={newJuntaId} onValueChange={setNewJuntaId}>
                        <SelectTrigger id="enc-junta">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          {juntas.map((j) => (
                            <SelectItem key={j.id} value={j.id}>{j.nombre}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Opciones de respuesta (mínimo 2)</Label>
                    {newOpciones.map((op, i) => (
                      <div key={i} className="flex gap-2">
                        <Input
                          placeholder={`Opción ${i + 1}`}
                          value={op}
                          onChange={(e) => setNewOpciones(newOpciones.map((o, idx) => idx === i ? e.target.value : o))}
                        />
                        {newOpciones.length > 2 && (
                          <button
                            type="button"
                            onClick={() => setNewOpciones(newOpciones.filter((_, idx) => idx !== i))}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    {newOpciones.length < 6 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full border-dashed"
                        onClick={() => setNewOpciones([...newOpciones, ''])}
                      >
                        <Plus className="mr-1 h-3 w-3" /> Agregar opción
                      </Button>
                    )}
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={saving}>
                      {saving ? 'Creando...' : 'Crear Encuesta'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Encuestas list */}
          <div className="mt-6 space-y-4">
            {loading ? (
              <p className="py-12 text-center text-sm text-muted-foreground">Cargando encuestas...</p>
            ) : encuestas.length > 0 ? (
              encuestas.map((enc) => {
                const total = totalVotes(enc);
                const opciones = enc.encuesta_opciones || [];
                const isOpen = enc.activa && !enc.cerrada;
                return (
                  <Card key={enc.id} className="border-border/60">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{enc.pregunta}</CardTitle>
                          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                            {enc.barrio && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {enc.barrio}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTimeAgo(enc.created_at)}
                            </span>
                            <span className="flex items-center gap-1">
                              <BarChart3 className="h-3 w-3" />
                              {total} votos
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isOpen ? (
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Abierta</Badge>
                          ) : (
                            <Badge variant="secondary">Cerrada</Badge>
                          )}
                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(enc.id)}
                              className="text-muted-foreground/50 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {opciones.map((op) => {
                        const pct = total > 0 ? Math.round(((op.voto_count || 0) / total) * 100) : 0;
                        return (
                          <div key={op.id}>
                            {isOpen ? (
                              <button
                                onClick={() => handleVote(enc.id, op.id)}
                                className="group flex w-full items-center gap-3 rounded-lg border border-border/60 p-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
                              >
                                <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-border group-hover:border-primary">
                                  <span className="h-2 w-2 rounded-full bg-transparent group-hover:bg-primary" />
                                </span>
                                <span className="flex-1 text-sm font-medium text-foreground">{op.texto}</span>
                                <span className="text-xs text-muted-foreground">{op.voto_count || 0} votos</span>
                              </button>
                            ) : (
                              <div className="rounded-lg border border-border/40 p-3">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="font-medium text-foreground">{op.texto}</span>
                                  <span className="text-muted-foreground">{op.voto_count || 0} ({pct}%)</span>
                                </div>
                                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                                  <div
                                    className="h-full rounded-full bg-primary transition-all"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {isOpen && isAdmin && (
                        <div className="flex items-center justify-between pt-2">
                          <Button variant="ghost" size="sm" className="gap-1" onClick={() => handleClose(enc.id)}>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Cerrar encuesta
                          </Button>
                          <span className="text-xs text-muted-foreground">Hacé clic en una opción para votar</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="py-12 text-center">
                <Vote className="mx-auto h-12 w-12 text-muted-foreground/30" />
                <p className="mt-3 text-sm text-muted-foreground">Aún no hay encuestas activas.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
