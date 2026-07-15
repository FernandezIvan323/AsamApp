import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

import { ErrorState, LoadingState } from '@/components/feedback/ResourceState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEvents } from '@/hooks/useEvents';
import { getStatusVariant } from '@/lib/eventStatus';
import { getWeekDays, getWeekRangeLabel } from '@/lib/weekUtils';

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const WEEK_OPTS = { weekStartsOn: 1 };

export default function Calendar() {
  const navigate = useNavigate();
  const [view, setView] = useState('month'); // 'month' | 'week'
  const [anchor, setAnchor] = useState(new Date());
  const { events, isLoading, error, refresh } = useEvents();

  const monthGridDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(anchor), WEEK_OPTS);
    const end = endOfWeek(endOfMonth(anchor), WEEK_OPTS);
    return eachDayOfInterval({ start, end });
  }, [anchor]);

  const weekDays = useMemo(() => getWeekDays(anchor), [anchor]);

  const eventsByDate = useMemo(() => {
    const map = new Map();
    for (const event of events) {
      if (!event.date || event.status === 'Cancelado') continue;
      const key = event.date;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(event);
    }
    for (const list of map.values()) {
      list.sort((a, b) => String(a.time || '').localeCompare(String(b.time || '')));
    }
    return map;
  }, [events]);

  const title = view === 'month'
    ? format(anchor, 'MMMM yyyy', { locale: es })
    : getWeekRangeLabel(anchor);

  const goPrev = () => {
    setAnchor(d => (view === 'month' ? subMonths(d, 1) : subWeeks(d, 1)));
  };
  const goNext = () => {
    setAnchor(d => (view === 'month' ? addMonths(d, 1) : addWeeks(d, 1)));
  };
  const goToday = () => setAnchor(new Date());

  const days = view === 'month' ? monthGridDays : weekDays;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">Calendario</Badge>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Calendario de eventos</h1>
          <p className="text-muted-foreground">Vista mes o semana de los asados programados.</p>
        </div>
        <Button onClick={() => navigate('/new-event')}>
          <Plus className="size-4" /> Nuevo presupuesto
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="capitalize">{title}</CardTitle>
            <CardDescription>Clic en un evento para ver el detalle.</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg border border-border p-0.5">
              <button
                type="button"
                onClick={() => setView('month')}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                  view === 'month' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Mes
              </button>
              <button
                type="button"
                onClick={() => setView('week')}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                  view === 'week' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Semana
              </button>
            </div>
            <Button variant="outline" size="icon" onClick={goPrev} aria-label="Anterior">
              <ChevronLeft className="size-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToday}>Hoy</Button>
            <Button variant="outline" size="icon" onClick={goNext} aria-label="Siguiente">
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingState title="Cargando calendario" />
          ) : error ? (
            <ErrorState description={error.message} onRetry={refresh} />
          ) : view === 'month' ? (
            <>
              <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
                {WEEKDAYS.map(day => <div key={day}>{day}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {days.map(day => {
                  const key = format(day, 'yyyy-MM-dd');
                  const dayEvents = eventsByDate.get(key) || [];
                  const inMonth = isSameMonth(day, anchor);
                  const today = isSameDay(day, new Date());

                  return (
                    <div
                      key={key}
                      className={`min-h-24 rounded-md border p-1.5 text-xs ${
                        inMonth ? 'bg-card' : 'bg-muted/20 text-muted-foreground'
                      } ${today ? 'border-primary ring-1 ring-primary/30' : 'border-border'}`}
                    >
                      <span className={`font-semibold ${today ? 'text-primary' : ''}`}>{format(day, 'd')}</span>
                      <div className="mt-1 space-y-0.5">
                        {dayEvents.slice(0, 3).map(event => (
                          <Link
                            key={event.id}
                            to={`/history/${event.id}`}
                            className="block truncate rounded bg-primary/15 px-1 py-0.5 text-[10px] hover:bg-primary/25"
                            title={event.title}
                          >
                            {event.time ? `${event.time} ` : ''}{event.title}
                          </Link>
                        ))}
                        {dayEvents.length > 3 && (
                          <span className="text-[10px] text-muted-foreground">+{dayEvents.length - 3} más</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              {/* Week view desktop */}
              <div className="hidden gap-2 md:grid md:grid-cols-7">
                {weekDays.map(day => {
                  const key = format(day, 'yyyy-MM-dd');
                  const dayEvents = eventsByDate.get(key) || [];
                  const today = isSameDay(day, new Date());
                  return (
                    <div
                      key={key}
                      className={`min-h-[14rem] rounded-xl border p-2 ${
                        today ? 'border-primary/50 bg-primary/5 ring-1 ring-primary/20' : 'border-border bg-card'
                      }`}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className={`text-xs font-semibold uppercase ${today ? 'text-primary' : 'text-muted-foreground'}`}>
                          {format(day, 'EEE', { locale: es })}
                        </span>
                        <span className={`text-sm font-bold ${today ? 'text-primary' : 'text-foreground'}`}>
                          {format(day, 'd')}
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {dayEvents.length === 0 ? (
                          <p className="text-[10px] text-muted-foreground/50">Sin eventos</p>
                        ) : (
                          dayEvents.map(event => (
                            <Link
                              key={event.id}
                              to={`/history/${event.id}`}
                              className="block rounded-lg border border-border/60 bg-secondary/50 px-2 py-1.5 transition hover:border-primary/40 hover:bg-primary/10"
                            >
                              <p className="text-[11px] font-semibold text-foreground line-clamp-2">{event.title}</p>
                              <div className="mt-1 flex flex-wrap items-center gap-1">
                                {event.time && <span className="text-[10px] text-muted-foreground">{event.time}</span>}
                                <Badge variant={getStatusVariant(event.status)} className="text-[9px] px-1 py-0">{event.status}</Badge>
                              </div>
                            </Link>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Week view mobile */}
              <div className="space-y-3 md:hidden">
                {weekDays.map(day => {
                  const key = format(day, 'yyyy-MM-dd');
                  const dayEvents = eventsByDate.get(key) || [];
                  const today = isSameDay(day, new Date());
                  return (
                    <div
                      key={key}
                      className={`rounded-xl border p-3 ${
                        today ? 'border-primary/40 bg-primary/5' : 'border-border bg-card'
                      }`}
                    >
                      <p className={`mb-2 text-sm font-semibold capitalize ${today ? 'text-primary' : 'text-foreground'}`}>
                        {format(day, "EEEE d MMM", { locale: es })}
                        {today ? ' · Hoy' : ''}
                      </p>
                      {dayEvents.length === 0 ? (
                        <p className="text-xs text-muted-foreground">Sin eventos</p>
                      ) : (
                        <div className="space-y-2">
                          {dayEvents.map(event => (
                            <Link
                              key={event.id}
                              to={`/history/${event.id}`}
                              className="flex items-center justify-between gap-2 rounded-lg border border-border/50 bg-secondary/40 px-3 py-2"
                            >
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-foreground">{event.title}</p>
                                {event.time && <p className="text-xs text-muted-foreground">{event.time}</p>}
                              </div>
                              <Badge variant={getStatusVariant(event.status)} className="shrink-0 text-[10px]">{event.status}</Badge>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
