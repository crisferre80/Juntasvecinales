'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Users,
  Plus,
  Trash2,
  ArrowLeft,
  User,
  MapPin,
  Phone,
  Mail,
  Save,
  Info,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
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
import { Separator } from '@/components/ui/separator';

interface FounderForm {
  nombre: string;
  dni: string;
  direccion: string;
  telefono: string;
}

const emptyFounder: FounderForm = { nombre: '', dni: '', direccion: '', telefono: '' };

export default function NuevaJuntaPage() {
  const { nombres: barrioNombres } = useBarrios();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [nombre, setNombre] = useState('');
  const [barrio, setBarrio] = useState('');
  const [delimitacion, setDelimitacion] = useState('');
  const [presidenteNombre, setPresidenteNombre] = useState('');
  const [presidenteTel, setPresidenteTel] = useState('');
  const [presidenteEmail, setPresidenteEmail] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [founders, setFounders] = useState<FounderForm[]>([
    { ...emptyFounder },
    { ...emptyFounder },
  ]);

  const addFounder = () => {
    setFounders([...founders, { ...emptyFounder }]);
  };

  const removeFounder = (index: number) => {
    setFounders(founders.filter((_, i) => i !== index));
  };

  const updateFounder = (index: number, field: keyof FounderForm, value: string) => {
    setFounders(
      founders.map((f, i) => (i === index ? { ...f, [field]: value } : f))
    );
  };

  const validFounders = founders.filter((f) => f.nombre.trim() && f.dni.trim());
  const minFounders = 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim() || !barrio || !delimitacion.trim() || !presidenteNombre.trim()) {
      toast.error('Faltan datos obligatorios', {
        description: 'Completá todos los campos marcados con *.',
      });
      return;
    }

    if (validFounders.length < minFounders) {
      toast.error(`Se requieren al menos ${minFounders} vecinos fundadores`, {
        description: `Actualmente tenés ${validFounders.length} con datos completos.`,
      });
      return;
    }

    setSaving(true);
    try {
      const { data: junta, error: juntaError } = await supabase
        .from('juntas')
        .insert({
          nombre: nombre.trim(),
          barrio,
          delimitacion_calles: delimitacion.trim(),
          presidente_nombre: presidenteNombre.trim(),
          presidente_telefono: presidenteTel.trim() || null,
          presidente_email: presidenteEmail.trim() || null,
          descripcion: descripcion.trim() || null,
          activa: true,
        })
        .select()
        .single();

      if (juntaError || !junta) {
        throw new Error(juntaError?.message || 'Error al crear la junta');
      }

      const miembrosData = validFounders.map((f) => ({
        junta_id: junta.id,
        nombre: f.nombre.trim(),
        dni: f.dni.trim(),
        direccion: f.direccion.trim(),
        telefono: f.telefono.trim() || null,
        es_fundador: true,
      }));

      const { error: miembrosError } = await supabase
        .from('miembros')
        .insert(miembrosData);

      if (miembrosError) throw miembrosError;

      toast.success('Junta Vecinal registrada', {
        description: `${junta.nombre} fue creada con ${validFounders.length} miembros fundadores.`,
      });
      router.push(`/juntas/${junta.id}`);
    } catch (err) {
      toast.error('Error al registrar la junta', {
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
        <div className="mx-auto max-w-3xl px-4 py-8 lg:px-6">
          <Link href="/juntas" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Volver a juntas
          </Link>

          <div className="mt-4">
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
              Registrar Nueva Junta Vecinal
            </h1>
            <p className="mt-1 text-muted-foreground">
              Completá los datos de la junta y los 10 vecinos fundadores obligatorios.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {/* Datos de la Junta */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Datos de la Junta Vecinal
                </CardTitle>
                <CardDescription>
                  Información básica de identificación del barrio.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre de la Junta *</Label>
                  <Input
                    id="nombre"
                    placeholder="Ej: Junta Vecinal Barrio Centro"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="barrio">Barrio *</Label>
                    <Select value={barrio} onValueChange={setBarrio}>
                      <SelectTrigger id="barrio">
                        <SelectValue placeholder="Seleccionar barrio" />
                      </SelectTrigger>
                      <SelectContent>
                        {barrioNombres.map((b) => (
                          <SelectItem key={b} value={b}>
                            {b}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="delimitacion">Delimitación de calles *</Label>
                    <Input
                      id="delimitacion"
                      placeholder="Ej: Av. San Martín, Tucumán, 25 de Mayo, Belgrano"
                      value={delimitacion}
                      onChange={(e) => setDelimitacion(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción (opcional)</Label>
                  <Textarea
                    id="descripcion"
                    placeholder="Breve descripción de la junta y sus objetivos..."
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Datos del Presidente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Presidente / Contacto
                </CardTitle>
                <CardDescription>
                  Persona responsable de la junta vecinal.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="presidente">Nombre y Apellido *</Label>
                  <Input
                    id="presidente"
                    placeholder="Nombre completo del presidente"
                    value={presidenteNombre}
                    onChange={(e) => setPresidenteNombre(e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="tel" className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5" />
                      Teléfono
                    </Label>
                    <Input
                      id="tel"
                      placeholder="Ej: 385 123 4567"
                      value={presidenteTel}
                      onChange={(e) => setPresidenteTel(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" />
                      Correo electrónico
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="correo@ejemplo.com"
                      value={presidenteEmail}
                      onChange={(e) => setPresidenteEmail(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Miembros Fundadores */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Veceros Fundadores / Integrantes
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Mínimo 10 vecinos fundadores. Actualmente: {validFounders.length}/10
                    </CardDescription>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
                  <Info className="h-4 w-4 shrink-0" />
                  <span>Los 10 vecinos fundadores son obligatorios para registrar la junta según la normativa municipal.</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {founders.map((founder, index) => (
                  <div key={index} className="rounded-lg border border-border/60 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {index + 1}
                      </span>
                      {founders.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeFounder(index)}
                          className="text-muted-foreground transition-colors hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Nombre y Apellido *</Label>
                        <Input
                          placeholder="Nombre completo"
                          value={founder.nombre}
                          onChange={(e) => updateFounder(index, 'nombre', e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">DNI *</Label>
                        <Input
                          placeholder="Ej: 12345678"
                          value={founder.dni}
                          onChange={(e) => updateFounder(index, 'dni', e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Dirección *</Label>
                        <Input
                          placeholder="Ej: 25 de Mayo 456"
                          value={founder.direccion}
                          onChange={(e) => updateFounder(index, 'direccion', e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Teléfono</Label>
                        <Input
                          placeholder="Ej: 385 123 4567"
                          value={founder.telefono}
                          onChange={(e) => updateFounder(index, 'telefono', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addFounder}
                  className="w-full gap-2 border-dashed"
                >
                  <Plus className="h-4 w-4" />
                  Agregar otro vecino
                </Button>

                {validFounders.length < minFounders && (
                  <p className="text-center text-sm text-amber-600">
                    Faltan {minFounders - validFounders.length} vecero(s) para completar el mínimo de 10 fundadores.
                  </p>
                )}
              </CardContent>
            </Card>

            <Separator />

            <div className="flex items-center justify-end gap-3">
              <Link href="/juntas">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" disabled={saving} className="gap-2">
                <Save className="h-4 w-4" />
                {saving ? 'Guardando...' : 'Registrar Junta'}
              </Button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
