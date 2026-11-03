import { Building2, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display text-sm font-bold text-foreground">
                Juntas Vecinales de La Banda
              </span>
              <span className="text-xs text-muted-foreground">
                Plataforma de gestión vecinal
              </span>
            </div>
          </div>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            Hecho con <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" /> para La Banda
          </p>
        </div>
        <div className="mt-6 border-t border-border pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Ciudad de La Banda, Santiago del Estero, Argentina
          </p>
        </div>
      </div>
    </footer>
  );
}
