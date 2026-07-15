import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format, isToday, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ArrowRight,
  Calendar as CalendarIcon,
  CalendarDays,
  CircleAlert,
  ClipboardList,
  Clock,
  Flame,
  ListChecks,
  MapPin,
  Plus,
  ShoppingCart,
  Users,
  Wallet,
} from 'lucide-react';

import { EmptyState, ErrorState, LoadingState } from '@/components/feedback/ResourceState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/PageTransition';
import { useEvents } from '@/hooks/useEvents';
import { getStatusVariant } from '@/lib/eventStatus';
import { currency, getDashboardSummary, getEventRealFinancials } from '@/lib/finance';
import {
  buildActionTodos,
  getWeekDays,
  getWeekRangeLabel,
  groupEventsByDay,
  isEventInWeek,
} from '@/lib/weekUtils';
import { getOperationsSummary } from '@/services/operationsApi';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

function getUserName() {
  try {
    const user = JSON.parse(localStorage.getItem('asamapp_user') || 'null');
    return user?.username || 'Usuario';
  } catch {
    return 'Usuario';
  }
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { events, isLoading, error, refresh } = useEvents();
  const [ops, setOps] = useState(null);
  const { pendingEvents, closedEvents } = getDashboardSummary(events);

  useEffect(() => {
    getOperationsSummary().then(setOps).catch(() => setOps(null));
  }, []);

  const weekDays = useMemo(() => getWeekDays(new Date()), []);
  const weekLabel = useMemo(() => getWeekRangeLabel(new Date()), []);

  const weekGroups = useMemo(
    () => groupEventsByDay(events, weekDays),
    [events, weekDays],
  );

  const weekEventCount = useMemo(
    () => events.filter(e => isEventInWeek(e)).length,
    [events],
  );

  const todayEvents = useMemo(
    () => events
      .filter(e => e.date && isToday(parseISO(e.date)) && e.status !== 'Cancelado')
      .sort((a, b) => String(a.time || '').localeCompare(String(b.time || ''))),
    [events],
  );

  const pendingPayments = useMemo(
    () => events.filter(e => {
      const r = getEventRealFinancials(e);
      return r.pending > 0 && !['Cancelado', 'Cobrado'].includes(e.status);
    }),
    [events],
  );

  const totalPendingRevenue = useMemo(
    () => pendingPayments.reduce((sum, e) => sum + getEventRealFinancials(e).pending, 0),
    [pendingPayments],
  );

  const todos = useMemo(
    () => buildActionTodos(events, ops),
    [events, ops],
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <FadeIn>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="size-4" />
              {format(new Date(), "EEEE d 'de' MMMM, yyyy", { locale: es })}
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {getGreeting()}, <span className="text-primary">{getUserName()}</span>
            </h1>
            <p className="mt-1 text-muted-foreground">
              {events.length === 0
                ? 'Creá tu primer presupuesto para armar la semana.'
                : `${weekEventCount} esta semana · ${todos.length} por hacer · ${pendingEvents} en curso · ${closedEvents} cobrado${closedEvents !== 1 ? 's' : ''}`}
            </p>
          </div>
          <Button onClick={() => navigate('/new-event')} size="lg" className="w-full sm:w-auto">
            <Plus className="size-4" /> Nuevo presupuesto
          </Button>
        </div>
      </FadeIn>

      {isLoading ? (
        <LoadingState title="Cargando tu semana" description="Trayendo eventos y pendientes." />
      ) : error ? (
        <ErrorState description={error.message} onRetry={refresh} />
      ) : (
        <>
          {/* Esta semana */}
          <FadeIn delay={0.04}>
            <div>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Esta semana</h2>
                  <p className="text-xs text-muted-foreground capitalize">{weekLabel}</p>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/calendar">Ver calendario</Link>
                </Button>
              </div>

              {/* Desktop: 7 columnas */}
              <div className="hidden gap-2 md:grid md:grid-cols-7">
                {weekGroups.map(g => (
                  <div
                    key={g.key}
                    className={`min-h-[8.5rem] rounded-xl border p-2 ${
                      g.isToday
                        ? 'border-primary/50 bg-primary/5 ring-1 ring-primary/20'
                        : 'border-border bg-card'
                    }`}
                  >
                    <div className="mb-2 flex items-baseline justify-between gap-1">
                      <span className={`text-[11px] font-semibold uppercase ${g.isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                        {g.label}
                      </span>
                      <span className={`text-sm font-bold ${g.isToday ? 'text-primary' : 'text-foreground'}`}>
                        {g.dayNum}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {g.events.length === 0 ? (
                        <p className="text-[10px] text-muted-foreground/50">—</p>
                      ) : (
                        g.events.slice(0, 3).map(ev => (
                          <Link
                            key={ev.id}
                            to={`/history/${ev.id}`}
                            className="block rounded-md bg-secondary/80 px-1.5 py-1 text-[10px] leading-tight transition hover:bg-primary/15"
                            title={ev.title}
                          >
                            <span className="font-medium text-foreground line-clamp-2">
                              {ev.time ? `${ev.time} ` : ''}{ev.title}
                            </span>
                          </Link>
                        ))
                      )}
                      {g.events.length > 3 && (
                        <p className="text-[10px] text-muted-foreground">+{g.events.length - 3}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile: lista por día */}
              <div className="space-y-2 md:hidden">
                {weekGroups.map(g => (
                  <div
                    key={g.key}
                    className={`rounded-xl border p-3 ${
                      g.isToday ? 'border-primary/40 bg-primary/5' : 'border-border bg-card'
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className={`text-sm font-semibold capitalize ${g.isToday ? 'text-primary' : 'text-foreground'}`}>
                        {format(g.day, "EEEE d", { locale: es })}
                        {g.isToday ? ' · Hoy' : ''}
                      </span>
                      <span className="text-xs text-muted-foreground">{g.events.length} evento{g.events.length !== 1 ? 's' : ''}</span>
                    </div>
                    {g.events.length === 0 ? (
                      <p className="text-xs text-muted-foreground">Sin eventos</p>
                    ) : (
                      <div className="space-y-1.5">
                        {g.events.map(ev => (
                          <Link
                            key={ev.id}
                            to={`/history/${ev.id}`}
                            className="flex items-center justify-between gap-2 rounded-lg border border-border/50 bg-secondary/40 px-2.5 py-2 text-sm"
                          >
                            <span className="truncate font-medium text-foreground">
                              {ev.time ? `${ev.time} · ` : ''}{ev.title}
                            </span>
                            <Badge variant={getStatusVariant(ev.status)} className="shrink-0 text-[10px]">{ev.status}</Badge>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Hoy */}
          {todayEvents.length > 0 && (
            <FadeIn delay={0.06}>
              <div>
                <h2 className="mb-3 text-sm font-semibold text-foreground">Hoy</h2>
                <Card>
                  <CardContent className="space-y-2 pt-5">
                    {todayEvents.map(ev => (
                      <div
                        key={ev.id}
                        className="flex flex-col gap-3 rounded-xl border border-primary/25 bg-primary/5 p-3 sm:flex-row sm:items-center"
                      >
                        <div className="flex size-11 shrink-0 flex-col items-center justify-center rounded-lg border border-primary/30 bg-primary/10">
                          <Clock className="size-4 text-primary" />
                          <span className="text-[10px] font-bold text-primary">{ev.time || '—'}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-foreground">{ev.title}</p>
                            <Badge variant={getStatusVariant(ev.status)} className="text-[10px]">{ev.status}</Badge>
                          </div>
                          <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                            {ev.client && <span>{ev.client}</span>}
                            {ev.location && (
                              <span className="inline-flex items-center gap-1"><MapPin className="size-3" />{ev.location}</span>
                            )}
                            {ev.guests > 0 && (
                              <span className="inline-flex items-center gap-1"><Users className="size-3" />{ev.guests}</span>
                            )}
                          </div>
                        </div>
                        <Button size="sm" asChild className="w-full sm:w-auto">
                          <Link to={`/history/${ev.id}`}>Ir al evento <ArrowRight className="size-3.5" /></Link>
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </FadeIn>
          )}

          {/* Qué me falta hacer */}
          <FadeIn delay={0.08}>
            <div>
              <h2 className="mb-3 text-sm font-semibold text-foreground">Qué me falta hacer</h2>
              {todos.length === 0 ? (
                <Card>
                  <CardContent className="py-8">
                    <EmptyState
                      title="Nada urgente"
                      description="No hay pendientes de confirmación, seña, compras o cobro."
                    />
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="space-y-2 pt-5">
                    {todos.map(t => (
                      <Link
                        key={t.id}
                        to={t.href}
                        className={`flex items-center gap-3 rounded-xl border p-3 transition hover:brightness-110 ${
                          t.level === 'error'
                            ? 'border-red-500/25 bg-red-500/5'
                            : t.level === 'warning'
                              ? 'border-amber-500/25 bg-amber-500/5'
                              : 'border-border bg-secondary/30'
                        }`}
                      >
                        <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
                          t.level === 'error' ? 'bg-red-500/15 text-red-300' : 'bg-amber-500/15 text-amber-300'
                        }`}>
                          <CircleAlert className="size-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-foreground">{t.title}</p>
                          <p className="truncate text-xs text-muted-foreground">{t.msg}</p>
                        </div>
                        <span className="hidden shrink-0 text-xs font-medium text-primary sm:inline">{t.actionLabel}</span>
                        <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </FadeIn>

          {/* KPIs */}
          <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StaggerItem>
              <Card className="border-l-4 border-l-primary">
                <CardContent className="pt-5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Esta semana</p>
                  <p className="mt-2 text-4xl font-bold text-foreground">{weekEventCount}</p>
                  <p className="mt-1 text-xs text-muted-foreground">eventos programados</p>
                </CardContent>
              </Card>
            </StaggerItem>
            <StaggerItem>
              <Card className="border-l-4 border-l-amber-500">
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Por cobrar</p>
                      <p className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">${currency(totalPendingRevenue)}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{pendingPayments.length} evento{pendingPayments.length !== 1 ? 's' : ''}</p>
                    </div>
                    <Wallet className="size-5 text-amber-400" />
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
            <StaggerItem>
              <Card className="border-l-4 border-l-emerald-500">
                <CardContent className="pt-5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Hoy</p>
                  <p className="mt-2 text-4xl font-bold text-foreground">{todayEvents.length}</p>
                  <p className="mt-1 text-xs text-muted-foreground">en agenda</p>
                </CardContent>
              </Card>
            </StaggerItem>
            <StaggerItem>
              <Card className="border-l-4 border-l-sky-500">
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Cobrados</p>
                      <p className="mt-2 text-4xl font-bold text-foreground">{closedEvents}</p>
                      <p className="mt-1 text-xs text-muted-foreground">eventos cerrados</p>
                    </div>
                    <Flame className="size-5 text-sky-400" />
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          </StaggerContainer>

          {/* Accesos */}
          <FadeIn delay={0.1}>
            <div>
              <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Accesos rápidos</h2>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[
                  { label: 'Calendario', desc: 'Mes y semana', icon: CalendarIcon, path: '/calendar', color: 'text-primary' },
                  { label: 'Lista compras', desc: 'Consolidar insumos', icon: ListChecks, path: '/shopping-list', color: 'text-amber-400' },
                  { label: 'Nueva compra', desc: 'Registrar mercado', icon: ShoppingCart, path: '/weekly-expenses/new', color: 'text-orange-400' },
                  { label: 'Inventario', desc: 'Stock e insumos', icon: ClipboardList, path: '/inventory', color: 'text-violet-400' },
                ].map(action => (
                  <button
                    key={action.path}
                    type="button"
                    onClick={() => navigate(action.path)}
                    className="group flex items-center gap-3 rounded-xl border border-border/60 bg-card p-4 text-left transition-all hover:border-primary/40 hover:bg-primary/5"
                  >
                    <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary ${action.color}`}>
                      <action.icon className="size-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground">{action.label}</p>
                      <p className="truncate text-xs text-muted-foreground">{action.desc}</p>
                    </div>
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                  </button>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Cobros pendientes compacto */}
          {pendingPayments.length > 0 && (
            <FadeIn delay={0.12}>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Cobros pendientes</CardTitle>
                  <CardDescription>Saldo abierto en eventos no cobrados.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {pendingPayments.slice(0, 5).map(e => {
                    const r = getEventRealFinancials(e);
                    return (
                      <Link
                        key={e.id}
                        to={`/history/${e.id}`}
                        className="flex items-center justify-between gap-3 rounded-lg border border-border/50 px-3 py-2.5 text-sm hover:bg-secondary/50"
                      >
                        <span className="truncate font-medium text-foreground">{e.title}</span>
                        <span className="shrink-0 font-semibold text-amber-300">${currency(r.pending)}</span>
                      </Link>
                    );
                  })}
                </CardContent>
              </Card>
            </FadeIn>
          )}
        </>
      )}
    </div>
  );
}
