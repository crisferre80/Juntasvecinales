'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Camera,
  Save,
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Junta } from '@/lib/types';
import { REPORTE_ESTADOS } from '@/lib/constants';
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

export default function NuevoReportePage() {
  const { nombres: barrioNombres } = useBarrios();
  const router = useRouter();
  const [juntas, setJuntas] = useState<Junta[]>([]);
  const [saving, setSaving] = useState(false);
  const [juntaId, setJuntaId] = useState('');
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [barrio, setBarrio] = useState('');
  const [estado, setEstado] = useState('Problemática detectada');
  const [fechaCaptura, setFechaCaptura] = useState(new Date().toISOString().split('T')[0]);
  const [imagenUrl, setImagenUrl] = useState('');
  const [uploadMode, setUploadMode] = useState<'url' | 'upload'>('url');
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState('');

  useEffect(() => {
    supabase.from('juntas').select('*').order('nombre').then(({ data }) => {
      setJuntas((data as Junta[]) || []);
    });
  }, []);

  useEffect(() => {
    setPreview(imagenUrl);
  }, [imagenUrl]);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `reportes/${Date.now()}.${ext}`;

      // Try uploading to Supabase storage
      const { data, error } = await supabase.storage
        .from('reportes')
        .upload(fileName, file);

      if (error) {
        // If bucket doesn't exist, fall back to object URL for preview
        toast.error('No se pudo subir la imagen al almacenamiento', {
          description: 'Usá una URL de imagen en su lugar.',
        });
        setUploadMode('url');
        return;
      }

      const { data: urlData } = supabase.storage
        .from('reportes')
        .getPublicUrl(fileName);

      setImagenUrl(urlData.publicUrl);
      toast.success('Imagen subida');
    } catch {
      toast.error('Error al subir imagen');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !barrio || !imagenUrl.trim()) {
      toast.error('Faltan campos obligatorios', {
        description: 'Título, barrio e imagen son requeridos.',
      });
      return;
    }
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('reportes_foto')
        .insert({
          junta_id: juntaId || null,
          titulo: titulo.trim(),
          descripcion: descripcion.trim() || null,
          barrio,
          estado,
          imagen_url: imagenUrl.trim(),
          fecha_captura: fechaCaptura,
        })
        .select()
        .single();

      if (error) throw error;
      toast.success('Reporte publicado');
      router.push('/reportes');
    } catch (err) {
      toast.error('Error al publicar reporte', {
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
          <Link href="/reportes" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Volver a la galería
          </Link>

          <h1 className="mt-4 flex items-center gap-2 font-display text-3xl font-bold tracking-tight text-foreground">
            <Camera className="h-7 w-7 text-primary" />
            Subir Reporte Fotográfico
          </h1>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {/* Image input */}
            <Card>
              <CardHeader>
                <CardTitle>Imagen del reporte *</CardTitle>
                <CardDescription>Subí una foto o ingresá la URL de una imagen.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setUploadMode('url')}
                    className={uploadMode === 'url' ? 'flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-primary bg-primary/5 px-3 py-2 text-sm font-medium text-primary' : 'flex flex-1 items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-muted'}
                  >
                    <LinkIcon className="h-4 w-4" />
                    URL de imagen
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMode('upload')}
                    className={uploadMode === 'upload' ? 'flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-primary bg-primary/5 px-3 py-2 text-sm font-medium text-primary' : 'flex flex-1 items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-muted'}
                  >
                    <Upload className="h-4 w-4" />
                    Subir archivo
                  </button>
                </div>

                {uploadMode === 'url' ? (
                  <div className="space-y-2">
                    <Label htmlFor="url">URL de la imagen *</Label>
                    <Input
                      id="url"
                      placeholder="https://ejemplo.com/foto.jpg"
                      value={imagenUrl}
                      onChange={(e) => setImagenUrl(e.target.value)}
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Seleccionar archivo</Label>
                    <div className="rounded-lg border-2 border-dashed border-border p-6 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file);
                        }}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload className="mx-auto h-8 w-8 text-muted-foreground/50" />
                        <p className="mt-2 text-sm text-muted-foreground">
                          {uploading ? 'Subiendo...' : 'Hacé clic para seleccionar una imagen'}
                        </p>
                      </label>
                    </div>
                  </div>
                )}

                {preview && (
                  <div className="relative overflow-hidden rounded-lg border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview} alt="Vista previa" className="max-h-64 w-full object-cover" />
                    <div className="absolute bottom-2 left-2">
                      <span className="rounded-md bg-black/60 px-2 py-1 text-xs text-white">Vista previa</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Details */}
            <Card>
              <CardHeader>
                <CardTitle>Datos del reporte</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título *</Label>
                  <Input
                    id="titulo"
                    placeholder="Ej: Bache en calle San Martín al 200"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
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
                          <SelectItem key={b} value={b}>{b}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado *</Label>
                    <Select value={estado} onValueChange={setEstado}>
                      <SelectTrigger id="estado">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {REPORTE_ESTADOS.map((e) => (
                          <SelectItem key={e} value={e}>{e}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fecha">Fecha de captura *</Label>
                    <Input
                      id="fecha"
                      type="date"
                      value={fechaCaptura}
                      onChange={(e) => setFechaCaptura(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="junta">Junta Vecinal (opcional)</Label>
                    <Select value={juntaId} onValueChange={setJuntaId}>
                      <SelectTrigger id="junta">
                        <SelectValue placeholder="Seleccionar junta" />
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
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    placeholder="Describí la situación que muestra la foto..."
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-end gap-3">
              <Link href="/reportes">
                <Button type="button" variant="outline">Cancelar</Button>
              </Link>
              <Button type="submit" disabled={saving || uploading} className="gap-2">
                <Save className="h-4 w-4" />
                {saving ? 'Publicando...' : 'Publicar Reporte'}
              </Button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
