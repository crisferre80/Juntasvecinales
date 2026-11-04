'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  FileText,
  Camera,
  MessageSquare,
  Map,
  MapPin,  ArrowLeft,
  Shield,
} from 'lucide-react';

const adminNav = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/juntas', label: 'Juntas', icon: Users },
  { href: '/admin/notas', label: 'Reclamos', icon: FileText },
  { href: '/admin/reportes', label: 'Reportes', icon: Camera },
  { href: '/admin/foro', label: 'Foro Municipal', icon: MessageSquare },
  { href: '/admin/mapa', label: 'Mapa Completo', icon: Map },
  { href: '/admin/barrios', label: 'Barrios', icon: MapPin },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile } = useAuth();

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="w-full border-b bg-muted/40 lg:w-64 lg:border-b-0 lg:border-r">
        <div className="flex h-16 items-center gap-2 border-b px-4 lg:h-auto lg:border-b-0 lg:px-6 lg:py-6">
          <Shield className="h-5 w-5 text-primary" />
          <div>
            <p className="font-display text-sm font-bold">Admin</p>
            <p className="text-xs text-muted-foreground truncate">
              {profile?.nombre ?? 'Municipio'}
            </p>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto p-2 lg:flex-col lg:gap-1 lg:p-4">
          {adminNav.map((item) => {
            const Icon = item.icon;
            const active = item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground lg:mt-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al sitio
          </Link>
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
