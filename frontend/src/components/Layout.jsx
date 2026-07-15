import { NavLink, Outlet } from 'react-router-dom';
import { Beef, Building2, Calculator, Calendar, CalendarDays, ClipboardList, Command, Download, FileStack, Flame, LineChart, ListChecks, Menu, PanelLeftClose, PlusCircle, ShoppingCart, StickyNote, Store, Utensils, Users, X, Zap } from 'lucide-react';

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
    label: 'PRINCIPAL',
    items: [
      { to: '/', label: 'Inicio', icon: CalendarDays },
      { to: '/calendar', label: 'Calendario', icon: Calendar },
      { to: '/history', label: 'Eventos', icon: Calculator },
      { to: '/new-event', label: 'Nuevo presupuesto', icon: PlusCircle, emphasize: true },
    ],
  },
  {
    label: 'OPERAR',
    items: [
      { to: '/weekly-expenses', label: 'Compras', icon: ShoppingCart },
      { to: '/shopping-list', label: 'Lista compras', icon: ListChecks },
      { to: '/inventory', label: 'Inventario', icon: Beef },
      { to: '/employees', label: 'Equipo', icon: Users },
    ],
  },
  {
    label: 'GESTIÓN',
    items: [
      { to: '/clients', label: 'Clientes', icon: Building2 },
      { to: '/finance', label: 'Finanzas', icon: LineChart },
    ],
  },
  {
    label: 'MÁS',
    items: [
      { to: '/quick-quote', label: 'Cotizador rápido', icon: Zap },
      { to: '/templates', label: 'Plantillas', icon: FileStack },
      { to: '/recipes', label: 'Recetas', icon: Utensils },
      { to: '/providers', label: 'Proveedores', icon: Store },
      { to: '/fixed-costs', label: 'Gastos fijos', icon: Building2 },
      { to: '/notes', label: 'Notas', icon: StickyNote },
      { to: '/operations', label: 'Operaciones', icon: ClipboardList },
      { to: '/export', label: 'Exportar', icon: Download },
    ],
  },
];

function SidebarNav({ collapsed, onNavigate }) {
  return (
    <nav className={cn(
      "flex-1 min-h-0 transition-all duration-300",
      collapsed
        ? "gap-1.5 px-1.5 py-3 flex-col items-center overflow-y-auto flex"
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
              'relative flex size-11 items-center justify-center rounded-lg font-medium transition-all duration-200 [&_svg]:text-[#A89880] hover:bg-[rgba(255,220,160,0.05)]',
              isActive && '[&_svg]:!text-[#E8834A] bg-[var(--primary-glow)]',
            )}
            title={label}
          >
            <Icon className="size-5 shrink-0" />
          </NavLink>
        ))
      ) : (
        navGroups.map(group => (
          <div key={group.label}>
            <p className="px-4 pb-1.5 pt-5 text-[11px] font-semibold uppercase tracking-widest select-none text-muted-foreground">
              {group.label}
            </p>
            {group.items.map(({ to, label, icon: Icon, emphasize }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={onNavigate}
                className={() => cn(
                  'relative flex items-center text-[15px] font-medium transition-all duration-200 hover:bg-muted/10',
                  emphasize && 'font-semibold',
                )}
                style={({ isActive }) => ({
                  padding: '10px 16px',
                  gap: '12px',
                  background: isActive
                    ? 'var(--primary-glow)'
                    : emphasize
                      ? 'rgba(232, 131, 74, 0.08)'
                      : 'transparent',
                  color: isActive || emphasize ? 'var(--primary)' : 'var(--muted-foreground)',
                  borderLeft: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                  borderRadius: isActive ? '0 6px 6px 0' : '6px',
                  paddingLeft: isActive ? '14px' : '16px',
                })}
              >
                <Icon className="size-5 shrink-0" />
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
        className="app-grid grid min-h-svh w-full"
        style={{ gridTemplateColumns: collapsed ? '4.5rem 1fr' : '17.5rem 1fr' }}
      >
        <style>{`
          @media (max-width: 1023px) {
            .app-grid { grid-template-columns: 1fr !important; }
            .app-aside { display: none !important; }
          }
        `}</style>

        {/* Desktop sidebar */}
        <aside className="app-aside w-full min-w-0 overflow-hidden lg:sticky lg:top-0 lg:h-svh lg:border-r transition-all duration-300 ease-out bg-card border-border">
          <div className="flex h-full min-w-0 flex-col overflow-hidden">
            <div className={cn(
              "flex items-center border-b transition-all duration-300",
              collapsed ? "justify-center px-1.5 py-4" : "gap-3 px-5 py-5",
            )} style={{ borderColor: 'var(--border)' }}>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
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
                    <h1 className="text-xl font-bold leading-none tracking-tight whitespace-nowrap text-foreground">AsamApp</h1>
                    <p className="mt-1 whitespace-nowrap text-muted-foreground text-xs">Eventos y presupuestos</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <SidebarNav collapsed={collapsed} />

            <div className={cn(
              "mt-auto hidden border-t lg:block space-y-2 border-border",
              collapsed ? "p-2" : "p-4",
            )}>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "w-full text-[15px] text-muted-foreground",
                  collapsed ? "justify-center px-0" : "justify-start",
                )}
                onClick={() => setPaletteOpen(true)}
                title="Buscar"
              >
                <Command className="size-5" />
                {!collapsed && <span className="flex-1 text-left">Buscar…</span>}
                {!collapsed && <kbd className="rounded border px-1.5 py-0.5 text-[11px] border-border bg-muted text-muted-foreground">⌘K</kbd>}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "w-full text-[15px] text-muted-foreground",
                  collapsed ? "justify-center px-0" : "justify-start",
                )}
                onClick={() => setCollapsed(!collapsed)}
                title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
              >
                <PanelLeftClose className="size-5" style={{ transform: collapsed ? 'rotate(180deg)' : 'none' }} />
                {!collapsed && <span>Colapsar menú</span>}
              </Button>
              {!collapsed && authEnabled && (
                <Button variant="outline" size="sm" className="w-full text-[15px]" onClick={handleLogout}>
                  <LogOut className="size-5" /> Cerrar sesión
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
                    <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                      <Flame className="size-5 text-primary" />
                    </span>
                    <div>
                      <h1 className="text-xl font-bold leading-none tracking-tight text-foreground">AsamApp</h1>
                      <p className="mt-1 text-xs text-muted-foreground">Eventos y presupuestos</p>
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
                    <Button variant="outline" size="sm" className="w-full text-[15px]" onClick={handleLogout}>
                      <LogOut className="size-5" /> Cerrar sesión
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

        <main className="min-w-0 w-full p-4 sm:p-6 lg:p-8 bg-background">
          <div className="w-full max-w-none">
            <div className="mb-4 hidden items-center gap-3 lg:flex">
              <div className="flex-1 min-w-0">
                <GlobalSearch />
              </div>
              <div className="flex shrink-0 items-center gap-2">
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
