'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ForoPost, ForoComentario } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { FORO_CATEGORIA_STYLES } from '@/lib/constants';
import { formatTimeAgo } from '@/lib/format';
import { MessageSquare, Send, ArrowRight } from 'lucide-react';

interface ForoPostWithComments extends ForoPost {
  foro_comentarios?: ForoComentario[];
}

export default function AdminForoPage() {
  const [posts, setPosts] = useState<ForoPostWithComments[]>([]);
  const [loading, setLoading] = useState(true);
  const [replying, setReplying] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    setLoading(true);
    const { data, error } = await supabase
      .from('foro_posts')
      .select('*, foro_comentarios(*)')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Error al cargar publicaciones');
    } else {
      setPosts((data as ForoPostWithComments[]) || []);
    }
    setLoading(false);
  }

  async function sendReply(postId: string) {
    if (!replyText.trim()) return;

    const { error } = await supabase.from('foro_comentarios').insert({
      post_id: postId,
      autor_nombre: 'Municipio de La Banda',
      contenido: replyText.trim(),
    });

    if (error) {
      toast.error('No se pudo enviar la respuesta');
    } else {
      toast.success('Respuesta publicada como Municipio');
      setReplyText('');
      setReplying(null);
      loadPosts();
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Foro Interbarrial</h1>
        <p className="text-muted-foreground">
          Respondé publicaciones oficalmente como Municipio de La Banda.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Cargando publicaciones...</p>
      ) : posts.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay publicaciones en el foro.</p>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => {
            const catStyle = FORO_CATEGORIA_STYLES[post.categoria] || FORO_CATEGORIA_STYLES.Problemática;
            const comentariosMunicipio =
              post.foro_comentarios?.filter((c) => c.autor_nombre === 'Municipio de La Banda') ?? [];

            return (
              <Card key={post.id}>
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={catStyle.bg}>
                      <span className={catStyle.color}>{catStyle.label}</span>
                    </Badge>
                    {post.prioridad && <Badge variant="destructive">Prioridad</Badge>}
                    {comentariosMunicipio.length > 0 && (
                      <Badge variant="outline" className="gap-1 text-emerald-600 border-emerald-200">
                        Respondido
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">
                    <Link href={`/foro/${post.id}`} className="hover:text-primary">
                      {post.titulo}
                    </Link>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Por {post.autor_nombre} · {post.barrio ?? 'Sin barrio'} ·{' '}
                    {formatTimeAgo(post.created_at)}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{post.contenido}</p>

                  {comentariosMunicipio.length > 0 && (
                    <div className="space-y-2 rounded-lg bg-muted/50 p-3">
                      <p className="text-xs font-semibold text-emerald-700">Respuestas del Municipio</p>
                      {comentariosMunicipio.map((c) => (
                        <p key={c.id} className="text-sm text-muted-foreground">
                          {c.contenido}
                        </p>
                      ))}
                    </div>
                  )}

                  {replying === post.id ? (
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Escribí la respuesta oficial del Municipio..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => sendReply(post.id)}
                          disabled={!replyText.trim()}
                          className="gap-1"
                        >
                          <Send className="h-3.5 w-3.5" />
                          Publicar respuesta
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setReplying(null);
                            setReplyText('');
                          }}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setReplying(post.id)}
                        className="gap-1"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        Responder como Municipio
                      </Button>
                      <Button asChild size="sm" variant="ghost" className="gap-1">
                        <Link href={`/foro/${post.id}`}>
                          Ver publicación <ArrowRight className="h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
