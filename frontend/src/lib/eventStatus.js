export const EVENT_STATUSES = [
  'Cotizado',
  'Pendiente',
  'Aprobado',
  'Compras pendientes',
  'En preparacion',
  'Realizado',
  'Cobrado',
  'Cancelado',
];

const STATUS_TRANSITIONS = {
  'Cotizado':           ['Pendiente', 'Aprobado', 'Cancelado'],
  'Pendiente':          ['Cotizado', 'Aprobado', 'Cancelado'],
  'Aprobado':           ['Compras pendientes', 'En preparacion', 'Cancelado'],
  'Compras pendientes': ['En preparacion', 'Cancelado'],
  'En preparacion':     ['Realizado', 'Cancelado'],
  'Realizado':          ['Cobrado'],
  'Cobrado':            [],
  'Cancelado':          ['Cotizado'],
};

export function getAllowedStatuses(currentStatus) {
  const next = STATUS_TRANSITIONS[currentStatus] ?? [];
  return [currentStatus, ...next];
}

export function getStatusVariant(status) {
  if (status === 'Cancelado') return 'destructive';
  if (status === 'Cobrado' || status === 'Realizado') return 'success';
  if (status === 'Aprobado' || status === 'En preparacion') return 'warning';
  if (status === 'Compras pendientes') return 'outline';
  return 'secondary';
}
