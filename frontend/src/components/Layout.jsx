import { NavLink, Outlet } from 'react-router-dom';
import { Beef, Building2, Calculator, Calendar, CalendarDays, ClipboardList, Command, Download, FileStack, Flame, LineChart, ListChecks, Menu, PanelLeftClose, ShoppingCart, StickyNote, Store, Utensils, Users, X, Zap } from 'lucide-react';

import CommandPalette from '@/components/CommandPalette';
import GlobalSearch from '@/components/GlobalSearch';
import NotificationsBell from '@/components/NotificationsBell';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import { clearStoredToken } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/api';
import { useEffect, useState } from 'react';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToastProvider } from '@/components/ui/toast';
import { motion, AnimatePresence } from 'framer-motion';

const navGroups = [
  {
    label: 'GESTIÓN',
    items: [
      { to: '/', label: 'Inicio', icon: CalendarDays },
      { to: '/calendar', label: 'Calendario', icon: Calendar },
      { to: '/history', label: 'Historial', icon: Calculator },
      { to: '/clients', label: 'Clientes', icon: Building2 },
      { to: '/employees', label: 'Empleados', icon: Users },
    ],
  },
  {
    label: 'COTIZACIONES',
    items: [
      { to: '/quick-quote', label: 'Cotizador rápido', icon: Zap },
      { to: '/templates', label: 'Plantillas', icon: FileStack },
    ],
  },
  {
    label: 'INVENTARIO',
    items: [
      { to: '/inventory', label: 'Insumos', icon: Beef },
      { to: '/recipes', label: 'Recetas', icon: Utensils },
      { to: '/providers', label: 'Proveedores', icon: Store },
    ],
  },
  {
    label: 'FINANZAS',
    items: [
      { to: '/weekly-expenses', label: 'Gastos Mercado', icon: ShoppingCart },
      { to: '/shopping-list', label: 'Lista compras', icon: ListChecks },
      { to: '/operations', label: 'Operaciones', icon: ClipboardList },
      { to: '/finance', label: 'Finanzas', icon: LineChart },
      { to: '/fixed-costs', label: 'Gastos fijos', icon: Building2 },
    ],
  },
  {
    label: 'OTROS',
    items: [
      { to: '/notes', label: 'Notas', icon: StickyNote },
      { to: '/export', label: 'Exportar', icon: Download },
    ],
  },
];

function SidebarNav({ collapsed, onNavigate }) {
  return (
    <nav className={cn(
      "flex-1 min-h-0 transition-all duration-300",
      collapsed
        ? "gap-1 px-2 py-3 flex-col items-center overflow-y-auto flex"
        : "overflow-y-auto py-2",
    )}>
      {collapsed ? (
        navGroups.flatMap(g => g.items).map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onNavigate}
            className={({ isActive }) => cn(
              'relative flex size-10 items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 [&_svg]:text-[#A89880] hover:bg-[rgba(255,220,160,0.05)]',
              isActive && '[&_svg]:!text-[#E8834A]',
            )}
            title={label}
          >
            <Icon className="size-4 shrink-0" />
          </NavLink>
        ))
      ) : (
        navGroups.map(group => (
          <div key={group.label}>
            <p className="px-4 pb-1 pt-4 text-[10px] font-semibold uppercase tracking-widest select-none text-muted-foreground">
              {group.label}
            </p>
            {group.items.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={onNavigate}
                className={() => cn(
                  'relative flex items-center text-sm font-medium transition-all duration-200 hover:bg-muted/10',
                )}
                style={({ isActive }) => ({
                  padding: '8px 16px',
                  gap: '10px',
                  background: isActive ? 'var(--primary-glow)' : 'transparent',
                  color: isActive ? 'var(--primary)' : 'var(--muted-foreground)',
                  borderLeft: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                  borderRadius: isActive ? '0 6px 6px 0' : '6px',
                  paddingLeft: isActive ? '14px' : '16px',
                })}
              >
                <Icon className="size-4 shrink-0" />
                <span className="truncate">{label}</span>
              </NavLink>
            ))}
          </div>
        ))
      )}
    </nav>
  );
}

export default function Layout() {
  const [authEnabled, setAuthEnabled] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    apiRequest('/api/auth/config').then(c => setAuthEnabled(c.enabled)).catch(() => {});
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen(p => !p);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => setShowLogoutConfirm(true);
  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    clearStoredToken();
    window.location.href = '/app/login';
  };

  return (
    <ToastProvider>
    <div className="min-h-svh bg-background text-foreground">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between gap-2 border-b border-border bg-card px-3 py-2 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="inline-flex size-9 items-center justify-center rounded-md text-foreground hover:bg-secondary/40"
          aria-label="Abrir menú"
        >
          <Menu className="size-5" />
        </button>
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
            <Flame className="size-4 text-primary" />
          </span>
          <span className="text-sm font-bold text-foreground">AsamApp</span>
        </div>
        <div className="flex items-center gap-1">
          <LocaleSwitcher />
          <NotificationsBell />
        </div>
      </div>

      <div
        className="app-grid grid min-h-svh"
        style={{ gridTemplateColumns: collapsed ? '4rem 1fr' : '17rem 1fr' }}
      >
        <style>{`
          @media (max-width: 1023px) {
            .app-grid { grid-template-columns: 1fr !important; }
            .app-aside { display: none !important; }
          }
        `}</style>

        {/* Desktop sidebar */}
        <aside className="app-aside lg:sticky lg:top-0 lg:h-svh lg:border-r transition-all duration-300 ease-out bg-card border-border">
          <div className="flex h-full flex-col">
            <div className={cn(
              "flex items-center border-b transition-all duration-300",
              collapsed ? "justify-center px-2 py-4" : "gap-3 px-5 py-5",
            )} style={{ borderColor: 'var(--border)' }}>
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Flame className="size-5 text-primary" />
              </span>
              <AnimatePresence>
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="overflow-hidden"
                  >
                    <h1 className="text-lg font-bold leading-none tracking-tight whitespace-nowrap text-foreground">AsamApp</h1>
                    <p className="mt-0.5 whitespace-nowrap text-muted-foreground text-[11px]">Eventos y presupuestos</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <SidebarNav collapsed={collapsed} />

            <div className="mt-auto hidden border-t lg:block space-y-2 p-4 border-border">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center text-muted-foreground"
                onClick={() => setPaletteOpen(true)}
              >
                <Command className="size-4" />
                {!collapsed && <span className="flex-1 text-left text-muted-foreground">Buscar…</span>}
                {!collapsed && <kbd className="rounded border px-1.5 py-0.5 text-[10px] border-border bg-muted text-muted-foreground">⌘K</kbd>}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center text-muted-foreground"
                onClick={() => setCollapsed(!collapsed)}
              >
                <PanelLeftClose className="size-4" style={{ transform: collapsed ? 'rotate(180deg)' : 'none' }} />
                {!collapsed && <span className="text-muted-foreground">Colapsar menú</span>}
              </Button>
              {!collapsed && authEnabled && (
                <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
                  <LogOut className="size-4" /> Cerrar sesión
                </Button>
              )}
            </div>
          </div>
        </aside>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
              />
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween', duration: 0.25 }}
                className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-card shadow-2xl lg:hidden"
              >
                <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                      <Flame className="size-5 text-primary" />
                    </span>
                    <div>
                      <h1 className="text-lg font-bold leading-none tracking-tight text-foreground">AsamApp</h1>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">Eventos y presupuestos</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary/40"
                    aria-label="Cerrar menú"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <SidebarNav collapsed={false} onNavigate={() => setMobileOpen(false)} />
                {authEnabled && (
                  <div className="border-t border-border p-4">
                    <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
                      <LogOut className="size-4" /> Cerrar sesión
                    </Button>
                  </div>
                )}
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
        <ConfirmDialog
          isOpen={showLogoutConfirm}
          title="Cerrar sesión"
          description="¿Estás seguro de que querés cerrar sesión? Vas a necesitar volver a iniciar sesión para acceder al sistema."
          confirmText="Cerrar sesión"
          cancelText="Cancelar"
          variant="warning"
          onConfirm={confirmLogout}
          onCancel={() => setShowLogoutConfirm(false)}
        />

        <main className="min-w-0 p-4 sm:p-6 lg:p-8 bg-background">
          <div className="mx-auto w-full max-w-7xl">
            <div className="mb-4 hidden items-center gap-3 lg:flex">
              <div className="flex-1">
                <GlobalSearch />
              </div>
              <div className="flex items-center gap-2">
                <LocaleSwitcher />
                <NotificationsBell />
              </div>
            </div>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
    </ToastProvider>
  );
}
