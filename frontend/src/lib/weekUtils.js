import {
  eachDayOfInterval,
  endOfWeek,
  format,
  isSameDay,
  isToday,
  isWithinInterval,
  parseISO,
  startOfWeek,
} from 'date-fns';
import { es } from 'date-fns/locale';

const WEEK_OPTS = { weekStartsOn: 1 };

/** Días Lun–Dom de la semana que contiene `date`. */
export function getWeekDays(date = new Date()) {
  const start = startOfWeek(date, WEEK_OPTS);
  const end = endOfWeek(date, WEEK_OPTS);
  return eachDayOfInterval({ start, end });
}

export function getWeekRangeLabel(date = new Date()) {
  const days = getWeekDays(date);
  const a = days[0];
  const b = days[6];
  if (a.getMonth() === b.getMonth()) {
    return `${format(a, 'd', { locale: es })} – ${format(b, "d 'de' MMMM", { locale: es })}`;
  }
  return `${format(a, "d MMM", { locale: es })} – ${format(b, "d MMM yyyy", { locale: es })}`;
}

export function eventDateKey(event) {
  return event?.date || null;
}

export function isEventOnDay(event, day) {
  if (!event?.date) return false;
  try {
    return isSameDay(parseISO(event.date), day);
  } catch {
    return false;
  }
}

export function isEventInWeek(event, weekAnchor = new Date()) {
  if (!event?.date || event.status === 'Cancelado') return false;
  try {
    const d = parseISO(event.date);
    return isWithinInterval(d, {
      start: startOfWeek(weekAnchor, WEEK_OPTS),
      end: endOfWeek(weekAnchor, WEEK_OPTS),
    });
  } catch {
    return false;
  }
}

export function groupEventsByDay(events, days) {
  return days.map(day => ({
    day,
    key: format(day, 'yyyy-MM-dd'),
    label: format(day, 'EEE', { locale: es }),
    dayNum: format(day, 'd'),
    isToday: isToday(day),
    events: (events || [])
      .filter(e => e.status !== 'Cancelado' && isEventOnDay(e, day))
      .sort((a, b) => String(a.time || '').localeCompare(String(b.time || ''))),
  }));
}

/**
 * Lista de pendientes accionables para el dashboard.
 * @returns {{ id, eventId?, title, msg, level, href, actionLabel }[]}
 */
export function buildActionTodos(events, ops = null) {
  const result = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const e of events || []) {
    if (!e.date || e.status === 'Cancelado' || e.status === 'Cobrado') continue;
    let days;
    try {
      const d = parseISO(e.date);
      d.setHours(0, 0, 0, 0);
      days = Math.round((d - today) / 86400000);
    } catch {
      continue;
    }

    const amountPaid = Number(e.amountPaid || 0);
    const totalPrice = Number(e.totalPrice || 0);
    const pendingPay = Math.max(0, totalPrice - amountPaid);
    const hasPurchases = (e.purchases || []).length > 0;
    const openTasks = (e.tasks || []).filter(t => !t.done).length;
    const status = e.status === 'Pendiente' ? 'Cotizado' : e.status;

    if (status === 'Cotizado' && days >= 0 && days <= 14) {
      result.push({
        id: `${e.id}-confirm`,
        eventId: e.id,
        title: e.title,
        msg: days === 0 ? 'Hoy y sin confirmar' : `En ${days} día${days !== 1 ? 's' : ''} · confirmar con cliente`,
        level: days <= 3 ? 'error' : 'warning',
        href: `/history/${e.id}`,
        actionLabel: 'Ver evento',
      });
    }

    if (['Aprobado', 'Cotizado'].includes(status) && pendingPay > 0 && amountPaid === 0 && days >= 0 && days <= 30) {
      result.push({
        id: `${e.id}-sena`,
        eventId: e.id,
        title: e.title,
        msg: 'Sin seña registrada',
        level: 'warning',
        href: `/history/${e.id}`,
        actionLabel: 'Registrar seña',
      });
    }

    if (['Aprobado', 'Compras pendientes'].includes(status) && !hasPurchases && days >= 0 && days <= 21) {
      result.push({
        id: `${e.id}-buy`,
        eventId: e.id,
        title: e.title,
        msg: status === 'Compras pendientes' ? 'Compras pendientes de cargar' : 'Aprobado · falta registrar compras',
        level: 'warning',
        href: `/history/${e.id}`,
        actionLabel: 'Ver evento',
      });
    }

    if (status === 'En preparacion' && openTasks > 0) {
      result.push({
        id: `${e.id}-tasks`,
        eventId: e.id,
        title: e.title,
        msg: `${openTasks} tarea${openTasks !== 1 ? 's' : ''} de preparación`,
        level: 'info',
        href: `/history/${e.id}`,
        actionLabel: 'Checklist',
      });
    }

    if (status === 'Realizado' && pendingPay > 0.01) {
      result.push({
        id: `${e.id}-cobro`,
        eventId: e.id,
        title: e.title,
        msg: 'Realizado · saldo por cobrar',
        level: 'error',
        href: `/history/${e.id}`,
        actionLabel: 'Cobrar',
      });
    }
  }

  if (ops?.lowStock?.length) {
    result.push({
      id: 'stock-low',
      title: 'Stock bajo',
      msg: `${ops.lowStock.length} insumo${ops.lowStock.length !== 1 ? 's' : ''} bajo el mínimo`,
      level: 'warning',
      href: '/inventory',
      actionLabel: 'Inventario',
    });
  } else if (Array.isArray(ops?.lowStock) === false && ops?.noteAlerts?.overdue > 0) {
    // fallback notes only
  }

  if (ops?.noteAlerts?.overdue > 0) {
    result.push({
      id: 'notes-overdue',
      title: 'Notas vencidas',
      msg: `${ops.noteAlerts.overdue} nota${ops.noteAlerts.overdue !== 1 ? 's' : ''} vencida${ops.noteAlerts.overdue !== 1 ? 's' : ''}`,
      level: 'error',
      href: '/notes',
      actionLabel: 'Ver notas',
    });
  }

  // Prioridad: error > warning > info; tope 8
  const rank = { error: 0, warning: 1, info: 2 };
  return result
    .sort((a, b) => (rank[a.level] ?? 9) - (rank[b.level] ?? 9))
    .slice(0, 8);
}
