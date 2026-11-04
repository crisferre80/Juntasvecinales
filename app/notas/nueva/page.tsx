'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  ArrowLeft,
  FileText,
  Save,
  Eye,
  Building2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Junta } from '@/lib/types';
import { TIPOS_RECLAMO } from '@/lib/constants';
import { useBarrios } from '@/lib/use-barrios';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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

export default function NuevaNotaPage() {
  const { nombres: barrioNombres } = useBarrios();
  const router = useRouter();
  const [juntas, setJuntas] = useState<Junta[]>([]);
  const [saving, setSaving] = useState(false);
  const [juntaId, setJuntaId] = useState('');
  const [tipoReclamo, setTipoReclamo] = useState('');
  const [asunto, setAsunto] = useState('');
  const [detalle, setDetalle] = useState('');
  const [barrio, setBarrio] = useState('');

  useEffect(() => {
    supabase.from('juntas').select('*').order('nombre').then(({ data }) => {
      setJuntas((data as Junta[]) || []);
    });
  }, []);

  const selectedJunta = juntas.find((j) => j.id === juntaId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tipoReclamo || !asunto.trim() || !detalle.trim()) {
      toast.error('Faltan campos obligatorios');
      return;
    }
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('notas_reclamo')
        .insert({
          junta_id: juntaId || null,
          tipo_reclamo: tipoReclamo,
          asunto: asunto.trim(),
          detalle: detalle.trim(),
          barrio: barrio || selectedJunta?.barrio || null,
          estado: 'Pendiente',
          fecha_reclamo: new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      if (error) throw error;
      toast.success('Nota de reclamo generada');
      router.push(`/notas/${data.id}`);
    } catch (err) {
      toast.error('Error al generar nota', {
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
        <div className="mx-auto max-w-2xl px-4 py-8 lg:px-6">
          <Link href="/notas" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Volver a notas
          </Link>

          <h1 className="mt-4 flex items-center gap-2 font-display text-3xl font-bold tracking-tight text-foreground">
            <FileText className="h-7 w-7 text-primary" />
            Generar Nota de Reclamo
          </h1>
          <p className="mt-1 text-muted-foreground">
            Generá una nota oficial dirigida al Municipio de La Banda, lista para imprimir.
          </p>

          <form onSubmit={handleSubmit} className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Datos del reclamo</CardTitle>
                <CardDescription>
                  Completá el formulario para generar la nota con formato institucional.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="junta">Junta Vecinal (opcional)</Label>
                  <Select value={juntaId} onValueChange={setJuntaId}>
                    <SelectTrigger id="junta">
                      <SelectValue placeholder="Seleccionar junta" />
                    </SelectTrigger>
                    <SelectContent>
                      {juntas.map((j) => (
                        <SelectItem key={j.id} value={j.id}>
                          {j.nombre} — {j.barrio}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedJunta && (
                    <p className="text-xs text-muted-foreground">
                      Presidente: {selectedJunta.presidente_nombre} · Barrio: {selectedJunta.barrio}
                    </p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo de Reclamo *</Label>
                    <Select value={tipoReclamo} onValueChange={setTipoReclamo}>
                      <SelectTrigger id="tipo">
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIPOS_RECLAMO.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="barrio">Barrio</Label>
                    <Select value={barrio} onValueChange={setBarrio}>
                      <SelectTrigger id="barrio">
                        <SelectValue placeholder={selectedJunta?.barrio || 'Seleccionar barrio'} />
                      </SelectTrigger>
                      <SelectContent>
                        {barrioNombres.map((b) => (
                          <SelectItem key={b} value={b}>{b}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="asunto">Asunto / Título *</Label>
                  <Input
                    id="asunto"
                    placeholder="Ej: Reposición de luminarias en calle Belgrano"
                    value={asunto}
                    onChange={(e) => setAsunto(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="detalle">Detalle de la situación *</Label>
                  <Textarea
                    id="detalle"
                    placeholder="Describí la problemática, ubicación precisa, cantidad de vecinos afectados, tiempo que lleva la situación, etc."
                    value={detalle}
                    onChange={(e) => setDetalle(e.target.value)}
                    rows={6}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 flex items-center justify-end gap-3">
              <Link href="/notas">
                <Button type="button" variant="outline">Cancelar</Button>
              </Link>
              <Button type="submit" disabled={saving} className="gap-2">
                <Save className="h-4 w-4" />
                {saving ? 'Generando...' : 'Generar Nota'}
              </Button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
