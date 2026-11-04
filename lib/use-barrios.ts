'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Barrio } from '@/lib/types';

export function useBarrios() {
  const [barrios, setBarrios] = useState<Barrio[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const { data } = await supabase.from('barrios').select('*').order('nombre');
    setBarrios((data as Barrio[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const nombres = useMemo(() => barrios.map((b) => b.nombre), [barrios]);

  return { barrios, nombres, loading, reload };
}
