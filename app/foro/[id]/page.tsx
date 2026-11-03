'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  ArrowLeft,
  MessageSquare,
  MapPin,
  Hand,
  ThumbsUp,
  MessageCircle,
  Flame,
  Send,
  Trash2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  ForoPost,
  ForoComentario,
  ForoApoyo,
  Junta,
} from '@/lib/types';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { formatDate, formatTimeAgo } from '@/lib/format';
import { FORO_CATEGORIA_STYLES } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function ForoPostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<ForoPost | null>(null);
  const [junta, setJunta] = useState<Junta | null>(null);
  const [comentarios, setComentarios] = useState<ForoComentario[]>([]);
  const [apoyos, setApoyos] = useState<ForoApoyo[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentAutor, setCommentAutor] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commenting, setCommenting] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) return;
    const [p, c, a] = await Promise.all([
      supabase.from('foro_posts').select('*').eq('id', id).maybeSingle(),
      supabase.from('foro_comentarios').select('*').eq('post_id', id).order('created_at', { ascending: false }),
      supabase.from('foro_apoyos').select('*').eq('post_id', id),
    ]);

    if (p.data) {
      setPost(p.data as ForoPost);
      if (p.data.junta_id) {
        const { data: jData } = await supabase
          .from('juntas')
          .select('*')
          .eq('id', p.data.junta_id)
          .maybeSingle();
        if (jData) setJunta(jData as Junta);
      }
    }
    setComentarios((c.data as ForoComentario[]) || []);
    setApoyos((a.data as ForoApoyo[]) || []);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSupport = async (tipo: string) => {
    const { error } = await supabase.from('foro_apoyos').insert({
      post_id: id,
      tipo,
      autor_nombre: null,
    });
    if (error) {
      toast.error('Error al registrar apoyo');
    } else {
      toast.success(tipo === 'Apoyar reclamo' ? 'Reclamo apoyado' : 'Marcado como interés');
      loadData();
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentAutor.trim() || !commentText.trim()) {
      toast.error('Completá tu nombre y el comentario');
      return;
    }
    setCommenting(true);
    const { error } = await supabase.from('foro_comentarios').insert({
      post_id: id,
      autor_nombre: commentAutor.trim(),
      contenido: commentText.trim(),
    });
    if (error) {
      toast.error('Error al comentar');
    } else {
      toast.success('Comentario publicado');
      setCommentText('');
      loadData();
    }
    setCommenting(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    const { error } = await supabase.from('foro_comentarios').delete().eq('id', commentId);
    if (error) {
      toast.error('Error al eliminar comentario');
    } else {
      loadData();
    }
  };

  const handleDeletePost = async () => {
    if (!confirm('¿Eliminar esta publicación? Se borrarán todos sus comentarios.')) return;
    const { error } = await supabase.from('foro_posts').delete().eq('id', id);
    if (error) {
      toast.error('Error al eliminar');
    } else {
      toast.success('Publicación eliminada');
      window.location.href = '/foro';
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

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/30" />
            <p className="mt-3 text-muted-foreground">No se encontró la publicación.</p>
            <Link href="/foro" className="mt-4 inline-block">
              <Button variant="outline">Volver al foro</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const catStyle = FORO_CATEGORIA_STYLES[post.categoria] || FORO_CATEGORIA_STYLES.Problemática;
  const apoyarCount = apoyos.filter((a) => a.tipo === 'Apoyar reclamo').length;
  const interesaCount = apoyos.filter((a) => a.tipo === 'Me interesa').length;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-8 lg:px-6">
          <Link href="/foro" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Volver al foro
          </Link>

          {/* Post */}
          <article className="mt-4">
            <div className="flex items-center gap-2">
              <span className={cn('rounded-full border px-2.5 py-0.5 text-xs font-medium', catStyle.bg, catStyle.color)}>
                {catStyle.label}
              </span>
              {post.prioridad && (
                <Badge variant="destructive" className="gap-1">
                  <Flame className="h-3 w-3" />
                  Prioridad
                </Badge>
              )}
            </div>

            <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {post.titulo}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span>Por <span className="font-medium text-foreground">{post.autor_nombre}</span></span>
              {post.barrio && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {post.barrio}
                </span>
              )}
              <span>{formatDate(post.created_at)}</span>
              {junta && (
                <Link href={`/juntas/${junta.id}`} className="flex items-center gap-1 text-primary hover:underline">
                  <MessageSquare className="h-3.5 w-3.5" />
                  {junta.nombre}
                </Link>
              )}
            </div>

            <div className="mt-5 whitespace-pre-wrap text-foreground/90 leading-relaxed">
              {post.contenido}
            </div>

            {/* Support buttons */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleSupport('Apoyar reclamo')}
                className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
              >
                <Hand className="h-4 w-4" />
                Apoyar reclamo ({apoyarCount})
              </button>
              <button
                onClick={() => handleSupport('Me interesa')}
                className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
              >
                <ThumbsUp className="h-4 w-4" />
                Me interesa ({interesaCount})
              </button>
              <button
                onClick={handleDeletePost}
                className="ml-auto flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Eliminar
              </button>
            </div>
          </article>

          {/* Comments */}
          <div className="mt-8 border-t border-border pt-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
              <MessageCircle className="h-5 w-5 text-primary" />
              Comentarios ({comentarios.length})
            </h2>

            {/* Comment form */}
            <form onSubmit={handleComment} className="mt-4 space-y-3">
              <Input
                placeholder="Tu nombre"
                value={commentAutor}
                onChange={(e) => setCommentAutor(e.target.value)}
              />
              <Textarea
                placeholder="Escribí tu comentario..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={3}
              />
              <Button type="submit" disabled={commenting} className="gap-2">
                <Send className="h-4 w-4" />
                {commenting ? 'Enviando...' : 'Enviar comentario'}
              </Button>
            </form>

            {/* Comment list */}
            <div className="mt-6 space-y-3">
              {comentarios.length > 0 ? (
                comentarios.map((c) => (
                  <Card key={c.id} className="border-border/60">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                              {c.autor_nombre.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-foreground">{c.autor_nombre}</span>
                            <span className="text-xs text-muted-foreground">{formatTimeAgo(c.created_at)}</span>
                          </div>
                          <p className="mt-2 text-sm text-foreground/90">{c.contenido}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteComment(c.id)}
                          className="text-muted-foreground/50 transition-colors hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Aún no hay comentarios. ¡Sé el primero en participar!
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
