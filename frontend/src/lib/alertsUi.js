import { AlertTriangle, AlertOctagon, Info, Package, Bell, Lock, StickyNote, ClipboardList } from 'lucide-react';

export const SEVERITY_STYLES = {
  info: { icon: Info, color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/25' },
  warn: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/25' },
  error: { icon: AlertOctagon, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/25' },
};

const TYPE_META = {
  event_unconfirmed: { icon: AlertTriangle, label: 'Evento sin confirmar' },
  payment_overdue: { icon: Lock, label: 'Cobro atrasado' },
  low_stock: { icon: Package, label: 'Stock bajo' },
  note_due: { icon: StickyNote, label: 'Nota para hoy' },
  note_overdue: { icon: StickyNote, label: 'Nota vencida' },
  task_pending: { icon: ClipboardList, label: 'Tarea atrasada' },
  purchase_no_event: { icon: Bell, label: 'Compra sin asignar' },
};

export function alertSeverityStyle(severity) {
  return SEVERITY_STYLES[severity] || SEVERITY_STYLES.info;
}

export function alertTypeMeta(alert) {
  return TYPE_META[alert.type] || { icon: Bell, label: 'Alerta' };
}

export function alertKey(alert) {
  const id = alert.eventId || alert.noteId || alert.catalogItemId || alert.title;
  return `${alert.type}-${id}`;
}

export function sortBySeverity(alerts) {
  const order = { error: 0, warn: 1, info: 2 };
  return [...alerts].sort((a, b) => (order[a.severity] ?? 3) - (order[b.severity] ?? 3));
}
