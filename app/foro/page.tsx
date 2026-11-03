'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  MessageSquare,
  Plus,
  Search,
  MapPin,
  Hand,
  ThumbsUp,
  MessageCircle,
  Flame,
  Filter,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ForoPostWithRelations, Junta } from '@/lib/types';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatTimeAgo } from '@/lib/format';
import { FORO_CATEGORIAS, FORO_CATEGORIA_STYLES } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function ForoPage() {
  const [posts, setPosts] = useState<ForoPostWithRelations[]>([]);
  const [juntas, setJuntas] = useState<Junta[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoria, setCategoria] = useState<string>('all');

  useEffect(() => {
    async function load() {
      const [p, j] = await Promise.all([
        supabase
          .from('foro_posts')
          .select('*, juntas(nombre, barrio), foro_comentarios(*), foro_apoyos(*)')
          .order('created_at', { ascending: false }),
        supabase.from('juntas').select('*'),
      ]);
      setPosts((p.data as ForoPostWithRelations[]) || []);
      setJuntas((j.data as Junta[]) || []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = posts.filter((post) => {
    const q = search.toLowerCase();
    const matchSearch =
      post.titulo.toLowerCase().includes(q) ||
      post.contenido.toLowerCase().includes(q) ||
      post.autor_nombre.toLowerCase().includes(q);
    const matchCat = categoria === 'all' || post.categoria === categoria;
    return matchSearch && matchCat;
  });

  const juntaMap = new Map(juntas.map((j) => [j.id, j]));

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="flex items-center gap-2 font-display text-3xl font-bold tracking-tight text-foreground">
                <MessageSquare className="h-7 w-7 text-primary" />
                Foro Interbarrial
              </h1>
              <p className="mt-1 text-muted-foreground">
                Espacio de conversación entre las juntas vecinales de La Banda
              </p>
            </div>
            <Link href="/foro/nuevo">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nueva Publicación
              </Button>
            </Link>
          </div>

          {/* Filters */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar publicaciones..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
              <Filter className="h-4 w-4 shrink-0 text-muted-foreground" />
              <button
                onClick={() => setCategoria('all')}
                className={cn(
                  'shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                  categoria === 'all'
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border text-muted-foreground hover:bg-muted'
                )}
              >
                Todas
              </button>
              {FORO_CATEGORIAS.map((cat) => {
                const style = FORO_CATEGORIA_STYLES[cat];
                return (
                  <button
                    key={cat}
                    onClick={() => setCategoria(cat)}
                    className={cn(
                      'shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                      categoria === cat
                        ? 'border-primary bg-primary text-primary-foreground'
                        : cn(style.bg, style.color, 'hover:opacity-80')
                    )}
                  >
                    {style.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Posts */}
          <div className="mt-6 space-y-3">
            {loading ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                Cargando publicaciones...
              </p>
            ) : filtered.length > 0 ? (
              filtered.map((post) => {
                const catStyle = FORO_CATEGORIA_STYLES[post.categoria] || FORO_CATEGORIA_STYLES.Problemática;
                const junta = post.junta_id ? juntaMap.get(post.junta_id) : null;
                const apoyos = post.foro_apoyos || [];
                const apoyarCount = apoyos.filter((a) => a.tipo === 'Apoyar reclamo').length;
                const interesaCount = apoyos.filter((a) => a.tipo === 'Me interesa').length;
                const commentCount = post.foro_comentarios?.length || 0;

                return (
                  <Link key={post.id} href={`/foro/${post.id}`}>
                    <Card className="group cursor-pointer border-border/60 transition-all hover:shadow-md hover:border-primary/30">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className={cn('rounded-full border px-2.5 py-0.5 text-xs font-medium', catStyle.bg, catStyle.color)}>
                                {catStyle.label}
                              </span>
                              {post.prioridad && (
                                <Badge variant="destructive" className="gap-1 px-1.5 text-xs">
                                  <Flame className="h-3 w-3" />
                                  Prioridad
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {formatTimeAgo(post.created_at)}
                              </span>
                            </div>
                            <h2 className="mt-2 font-display text-lg font-semibold text-foreground group-hover:text-primary">
                              {post.titulo}
                            </h2>
                            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                              {post.contenido}
                            </p>
                            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                              <span>Por <span className="font-medium text-foreground">{post.autor_nombre}</span></span>
                              {post.barrio && (
                                <span className="flex items-center gap-0.5">
                                  <MapPin className="h-3 w-3" />
                                  {post.barrio}
                                </span>
                              )}
                              {junta && (
                                <span className="flex items-center gap-0.5">
                                  <MessageSquare className="h-3 w-3" />
                                  {junta.nombre}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Engagement */}
                        <div className="mt-3 flex items-center gap-3 border-t border-border/40 pt-3">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <ThumbsUp className="h-3.5 w-3.5 text-blue-600" />
                            {interesaCount} Me interesa
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Hand className="h-3.5 w-3.5 text-red-600" />
                            {apoyarCount} Apoyan
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                            {commentCount} comentarios
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })
            ) : (
              <div className="py-12 text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/30" />
                <p className="mt-3 text-sm text-muted-foreground">
                  {search || categoria !== 'all' ? 'No se encontraron publicaciones.' : 'Aún no hay publicaciones en el foro.'}
                </p>
                {!search && categoria === 'all' && (
                  <Link href="/foro/nuevo">
                    <Button className="mt-4 gap-2">
                      <Plus className="h-4 w-4" />
                      Crear primera publicación
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
