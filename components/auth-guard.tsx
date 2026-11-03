'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  fallback?: React.ReactNode;
}

const publicPaths = ['/', '/login', '/registro'];
const adminPrefix = '/admin';

export function AuthGuard({ children, requireAdmin = false, fallback }: AuthGuardProps) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublic = publicPaths.includes(pathname);
  const isAdminRoute = pathname.startsWith(adminPrefix);

  useEffect(() => {
    if (loading) return;

    if (!user && !isPublic) {
      router.replace('/login');
      return;
    }

    if (user && (pathname === '/login' || pathname === '/registro')) {
      router.replace('/');
      return;
    }

    if ((isAdminRoute || requireAdmin) && !isAdmin) {
      router.replace('/');
      return;
    }
  }, [loading, user, isAdmin, pathname, router, isPublic, isAdminRoute, requireAdmin]);

  if (loading) {
    return (
      fallback ?? (
        <div className="flex h-screen w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )
    );
  }

  if (!user && !isPublic) {
    return null;
  }

  if ((isAdminRoute || requireAdmin) && !isAdmin) {
    return null;
  }

  return <>{children}</>;
}
