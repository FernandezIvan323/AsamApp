import { NavLink, Outlet } from 'react-router-dom';
import { Beef, Building2, Calculator, Calendar, CalendarDays, ChefHat, ClipboardList, Download, FileStack, LineChart, ListChecks, ShoppingCart, StickyNote, Store, Utensils, Zap } from 'lucide-react';

import GlobalSearch from '@/components/GlobalSearch';
import { clearStoredToken } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/api';
import { useEffect, useState } from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { to: '/', label: 'Inicio', icon: CalendarDays },
  { to: '/calendar', label: 'Calendario', icon: Calendar },
  { to: '/history', label: 'Historial', icon: Calculator },
  { to: '/quick-quote', label: 'Cotizador rápido', icon: Zap },
  { to: '/templates', label: 'Plantillas', icon: FileStack },
  { to: '/inventory', label: 'Insumos', icon: Beef },
  { to: '/recipes', label: 'Recetas', icon: Utensils },
  { to: '/providers', label: 'Proveedores', icon: Store },
  { to: '/weekly-expenses', label: 'Gastos Mercado', icon: ShoppingCart },
  { to: '/shopping-list', label: 'Lista compras', icon: ListChecks },
  { to: '/operations', label: 'Operaciones', icon: ClipboardList },
  { to: '/finance', label: 'Finanzas', icon: LineChart },
  { to: '/fixed-costs', label: 'Gastos fijos', icon: Building2 },
  { to: '/notes', label: 'Notas', icon: StickyNote },
  { to: '/export', label: 'Exportar', icon: Download },
];

export default function Layout() {
  const [authEnabled, setAuthEnabled] = useState(false);

  useEffect(() => {
    apiRequest('/api/auth/config').then(c => setAuthEnabled(c.enabled)).catch(() => {});
  }, []);

  const handleLogout = () => {
    clearStoredToken();
    window.location.reload();
  };

  return (
    <div className="min-h-svh bg-background text-foreground">
      <div className="grid min-h-svh lg:grid-cols-[17rem_1fr]">
        <aside className="border-sidebar-border bg-sidebar/95 text-sidebar-foreground lg:sticky lg:top-0 lg:h-svh lg:border-r">
          <div className="flex h-full flex-col">
            <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-5">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <ChefHat className="size-7" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold leading-none">AsamApp</h1>
                <p className="mt-1 text-xs text-muted-foreground">Eventos y presupuestos</p>
              </div>
            </div>

            <nav className="flex gap-2 overflow-x-auto px-3 py-3 lg:flex-col lg:overflow-visible lg:p-4">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) => cn(
                    'inline-flex h-10 min-w-fit items-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                    isActive && 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm',
                  )}
                >
                  <Icon className="size-4" />
                  {label}
                </NavLink>
              ))}
            </nav>

            <div className="mt-auto hidden border-t border-sidebar-border p-4 lg:block space-y-2">
              <div className="rounded-lg border border-sidebar-border bg-background/40 p-3">
                <p className="text-xs font-medium text-foreground">Sistema local</p>
                <p className="mt-1 text-xs text-muted-foreground">API, inventario y finanzas conectados a SQLite.</p>
              </div>
              {authEnabled && (
                <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
                  <LogOut className="size-4" /> Cerrar sesión
                </Button>
              )}
            </div>
          </div>
        </aside>

        <main className="min-w-0 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-7xl">
            <GlobalSearch />
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
