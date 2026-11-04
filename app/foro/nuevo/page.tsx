'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  ArrowLeft,
  MessageSquare,
  Save,
  Flame,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  FORO_CATEGORIAS,
} from '@/lib/constants';
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
import { Switch } from '@/components/ui/switch';

export default function NuevoPostPage() {
  const { nombres: barrioNombres } = useBarrios();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [autor, setAutor] = useState('');
  const [categoria, setCategoria] = useState('Problemática');
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [barrio, setBarrio] = useState('');
  const [prioridad, setPrioridad] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!autor.trim() || !titulo.trim() || !contenido.trim()) {
      toast.error('Faltan campos obligatorios');
      return;
    }
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('foro_posts')
        .insert({
          autor_nombre: autor.trim(),
          categoria,
          titulo: titulo.trim(),
          contenido: contenido.trim(),
          barrio: barrio || null,
          prioridad,
        })
        .select()
        .single();

      if (error) throw error;
      toast.success('Publicación creada');
      router.push(`/foro/${data.id}`);
    } catch (err) {
      toast.error('Error al crear publicación', {
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
          <Link href="/foro" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Volver al foro
          </Link>

          <h1 className="mt-4 flex items-center gap-2 font-display text-3xl font-bold tracking-tight text-foreground">
            <MessageSquare className="h-7 w-7 text-primary" />
            Nueva Publicación
          </h1>

          <form onSubmit={handleSubmit} className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Datos de la publicación</CardTitle>
                <CardDescription>
                  Compartí una problemática, propuesta, aviso o evento del barrio.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="autor">Tu nombre *</Label>
                  <Input
                    id="autor"
                    placeholder="Nombre y apellido"
                    value={autor}
                    onChange={(e) => setAutor(e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoría *</Label>
                    <Select value={categoria} onValueChange={setCategoria}>
                      <SelectTrigger id="categoria">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FORO_CATEGORIAS.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="barrio">Barrio</Label>
                    <Select value={barrio} onValueChange={setBarrio}>
                      <SelectTrigger id="barrio">
                        <SelectValue placeholder="Seleccionar barrio" />
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
                  <Label htmlFor="titulo">Título *</Label>
                  <Input
                    id="titulo"
                    placeholder="Resumen breve del tema"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contenido">Contenido *</Label>
                  <Textarea
                    id="contenido"
                    placeholder="Describí el detalle de la publicación..."
                    value={contenido}
                    onChange={(e) => setContenido(e.target.value)}
                    rows={6}
                    required
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-red-600" />
                    <div>
                      <Label htmlFor="prioridad" className="text-sm font-medium">Marcar como prioridad</Label>
                      <p className="text-xs text-muted-foreground">Resalta esta publicación como urgente</p>
                    </div>
                  </div>
                  <Switch
                    id="prioridad"
                    checked={prioridad}
                    onCheckedChange={setPrioridad}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 flex items-center justify-end gap-3">
              <Link href="/foro">
                <Button type="button" variant="outline">Cancelar</Button>
              </Link>
              <Button type="submit" disabled={saving} className="gap-2">
                <Save className="h-4 w-4" />
                {saving ? 'Publicando...' : 'Publicar'}
              </Button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
