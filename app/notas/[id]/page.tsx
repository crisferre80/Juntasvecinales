'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  ArrowLeft,
  FileText,
  Printer,
  Building2,
  MapPin,
  Calendar,
  Trash2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { NotaReclamo, Junta } from '@/lib/types';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDate } from '@/lib/format';
import { NOTA_ESTADO_STYLES, NOTA_ESTADOS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function NotaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [nota, setNota] = useState<NotaReclamo | null>(null);
  const [junta, setJunta] = useState<Junta | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    async function load() {
      const { data } = await supabase
        .from('notas_reclamo')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (data) {
        setNota(data as NotaReclamo);
        if (data.junta_id) {
          const { data: jData } = await supabase
            .from('juntas')
            .select('*')
            .eq('id', data.junta_id)
            .maybeSingle();
          if (jData) setJunta(jData as Junta);
        }
      }
      setLoading(false);
    }
    load();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleUpdateEstado = async (nuevoEstado: string) => {
    const { error } = await supabase
      .from('notas_reclamo')
      .update({ estado: nuevoEstado })
      .eq('id', id);
    if (error) {
      toast.error('Error al actualizar estado');
    } else {
      setNota({ ...nota!, estado: nuevoEstado });
      toast.success('Estado actualizado a: ' + nuevoEstado);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Eliminar esta nota de reclamo?')) return;
    const { error } = await supabase.from('notas_reclamo').delete().eq('id', id);
    if (error) {
      toast.error('Error al eliminar');
    } else {
      toast.success('Nota eliminada');
      window.location.href = '/notas';
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

  if (!nota) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground/30" />
            <p className="mt-3 text-muted-foreground">No se encontró la nota.</p>
            <Link href="/notas" className="mt-4 inline-block">
              <Button variant="outline">Volver a notas</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const style = NOTA_ESTADO_STYLES[nota.estado] || NOTA_ESTADO_STYLES.Pendiente;
  const today = formatDate(new Date());

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-8 lg:px-6">
          <div className="no-print flex items-center justify-between">
            <Link href="/notas" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Volver a notas
            </Link>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={handlePrint}>
                <Printer className="h-4 w-4" />
                Imprimir / PDF
              </Button>
              <Button variant="outline" size="sm" className="gap-2 text-destructive hover:text-destructive" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
                Eliminar
              </Button>
            </div>
          </div>

          {/* Status bar */}
          <div className="no-print mt-4 flex items-center gap-3 rounded-lg border border-border/60 p-3">
            <span className={cn('flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium', style.bg, style.color)}>
              <span className={cn('h-1.5 w-1.5 rounded-full', style.dot)} />
              {nota.estado}
            </span>
            <span className="text-sm text-muted-foreground">Cambiar estado:</span>
            <Select value={nota.estado} onValueChange={handleUpdateEstado}>
              <SelectTrigger className="h-8 w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NOTA_ESTADOS.map((e) => (
                  <SelectItem key={e} value={e}>{e}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Official Letter - Print Area */}
          <div className="print-area mt-6">
            <Card className="border-2 border-border">
              <CardContent className="p-8 sm:p-12">
                {/* Header */}
                <div className="flex items-start justify-between border-b-2 border-foreground/10 pb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-display text-sm font-bold text-foreground">
                        {junta?.nombre || 'Junta Vecinal'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {junta?.barrio || nota.barrio} — La Banda, Santiago del Estero
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <p>Nota Nº: {nota.id.slice(0, 8).toUpperCase()}</p>
                    <p>Fecha: {formatDate(nota.fecha_reclamo)}</p>
                  </div>
                </div>

                {/* Recipient */}
                <div className="mt-6">
                  <p className="text-sm font-semibold text-foreground">Al Intendente Municipal</p>
                  <p className="text-sm text-muted-foreground">Municipalidad de La Banda</p>
                  <p className="text-sm text-muted-foreground">S / D</p>
                </div>

                {/* Subject */}
                <div className="mt-6">
                  <p className="text-sm">
                    <span className="font-bold">REF:</span>{' '}
                    <span className="underline">{nota.tipo_reclamo} — {nota.asunto}</span>
                  </p>
                </div>

                {/* Body */}
                <div className="mt-6 space-y-4 text-sm leading-relaxed text-foreground/90">
                  <p>
                    De nuestra mayor consideración:
                  </p>
                  <p>
                    Quien suscribe, en representación de{' '}
                    <strong>{junta?.nombre || 'la Junta Vecinal'}</strong> del barrio{' '}
                    <strong>{junta?.barrio || nota.barrio}</strong>, me dirijo a Ud. con el fin de
                    solicitar formalmente la atención de la siguiente situación:
                  </p>
                  <div className="whitespace-pre-wrap rounded-lg border border-border/40 bg-muted/30 p-4">
                    {nota.detalle}
                  </div>
                  <p>
                    La problemática señalada afecta directamente a los vecinos del barrio{' '}
                    <strong>{junta?.barrio || nota.barrio || 'correspondiente'}</strong>
                    {junta?.delimitacion_calles && (
                      <> (delimitado por {junta.delimitacion_calles})</>
                    )}, por lo que solicitamos su pronta intervención a fin de dar solución a la
                    misma.
                  </p>
                  <p>
                    Agradecemos su atención y quedamos a disposición para cualquier consulta o
                    información adicional que sea necesaria.
                  </p>
                  <p>
                    Sin otro particular, saluda atentamente.
                  </p>
                </div>

                {/* Signature */}
                <div className="mt-12 flex flex-col items-center">
                  <div className="w-64 border-t border-foreground/40 pt-2 text-center">
                    <p className="text-sm font-semibold text-foreground">
                      {junta?.presidente_nombre || 'Presidente de la Junta Vecinal'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Presidente — {junta?.nombre || 'Junta Vecinal'}
                    </p>
                    {junta?.presidente_telefono && (
                      <p className="text-xs text-muted-foreground">Tel: {junta.presidente_telefono}</p>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-8 border-t border-foreground/10 pt-4 text-center text-xs text-muted-foreground">
                  <p>Ciudad de La Banda, Santiago del Estero — {formatDate(nota.fecha_reclamo)}</p>
                  <p className="mt-1">Generado a través de la Plataforma de Juntas Vecinales de La Banda</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
