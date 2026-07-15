export const EVENT_STATUSES = [
  'Cotizado',
  'Aprobado',
  'Compras pendientes',
  'En preparacion',
  'Realizado',
  'Cobrado',
  'Cancelado',
];

const LEGACY_ALIASES = {
  Pendiente: 'Cotizado',
};

const STATUS_TRANSITIONS = {
  Cotizado: ['Aprobado', 'Cancelado'],
  Aprobado: ['Compras pendientes', 'En preparacion', 'Cancelado'],
  'Compras pendientes': ['En preparacion', 'Cancelado'],
  'En preparacion': ['Realizado', 'Cancelado'],
  Realizado: ['Cobrado'],
  Cobrado: [],
  Cancelado: ['Cotizado'],
};

export const STATUS_COLORS = {
  Cotizado: 'bg-sky-500/15 text-sky-300 border-sky-500/20',
  Aprobado: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  'Compras pendientes': 'bg-orange-500/15 text-orange-300 border-orange-500/20',
  'En preparacion': 'bg-violet-500/15 text-violet-300 border-violet-500/20',
  Realizado: 'bg-violet-500/15 text-violet-300 border-violet-500/20',
  Cobrado: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  Cancelado: 'bg-red-500/15 text-red-300 border-red-500/20',
  Pendiente: 'bg-sky-500/15 text-sky-300 border-sky-500/20',
};

export function normalizeStatus(status) {
  if (!status) return status;
  return LEGACY_ALIASES[status] || status;
}

export function getAllowedStatuses(currentStatus) {
  const normalized = normalizeStatus(currentStatus);
  const next = STATUS_TRANSITIONS[normalized] ?? [];
  const current = currentStatus && !EVENT_STATUSES.includes(currentStatus)
    ? normalized
    : currentStatus;
  return [...new Set([current, ...next].filter(Boolean))];
}

export function getStatusVariant(status) {
  const s = normalizeStatus(status);
  if (s === 'Cancelado') return 'destructive';
  if (s === 'Cobrado' || s === 'Realizado') return 'success';
  if (s === 'Aprobado' || s === 'En preparacion') return 'warning';
  if (s === 'Compras pendientes') return 'outline';
  return 'secondary';
}

/** CTA de “siguiente paso” según estado del evento. */
export function getNextStep(event) {
  const status = normalizeStatus(event?.status);
  const pending = Math.max(0, Number(event?.totalPrice || 0) - Number(event?.amountPaid || 0));
  const hasPurchases = (event?.purchases || []).length > 0;
  const openTasks = (event?.tasks || []).filter(t => !t.done).length;

  switch (status) {
    case 'Cotizado':
      return {
        title: 'Confirmá con el cliente',
        description: pending > 0 || Number(event?.totalPrice) > 0
          ? 'Registrá la seña y pasá el evento a Aprobado cuando confirmen.'
          : 'Completá el presupuesto y pedí la seña.',
        primaryLabel: 'Registrar seña',
        primaryAction: 'payment',
        secondaryLabel: 'Marcar aprobado',
        secondaryAction: 'status:Aprobado',
      };
    case 'Aprobado':
      return {
        title: hasPurchases ? 'Seguí con las compras o la preparación' : 'Armá la compra del evento',
        description: 'Usá la lista de compras o registrá el gasto de mercado con este evento.',
        primaryLabel: 'Registrar compra',
        primaryAction: 'purchase',
        secondaryLabel: 'Lista de compras',
        secondaryAction: 'shopping-list',
      };
    case 'Compras pendientes':
      return {
        title: 'Cargá lo que gastaste en el mercado',
        description: 'Cada compra con este evento alimenta el margen real.',
        primaryLabel: 'Nueva compra',
        primaryAction: 'purchase',
        secondaryLabel: 'Pasar a preparación',
        secondaryAction: 'status:En preparacion',
      };
    case 'En preparacion':
      return {
        title: openTasks > 0 ? `Completá la preparación (${openTasks} tareas)` : 'Prepará el día del evento',
        description: 'Checklist, equipo y horas de personal.',
        primaryLabel: 'Agregar tarea',
        primaryAction: 'task',
        secondaryLabel: 'Registrar horas',
        secondaryAction: 'labor',
      };
    case 'Realizado':
      return {
        title: pending > 0 ? 'Cobrà el saldo pendiente' : 'Cerrá el evento como cobrado',
        description: pending > 0
          ? `Saldo pendiente: registrá el pago final.`
          : 'Ya está cobrado el total; podés marcar Cobrado.',
        primaryLabel: pending > 0 ? 'Registrar pago' : 'Marcar cobrado',
        primaryAction: pending > 0 ? 'payment' : 'status:Cobrado',
      };
    case 'Cobrado':
      return {
        title: 'Evento cerrado',
        description: 'Solo consulta, PDF o exportar finanzas.',
        primaryLabel: 'Ver finanzas',
        primaryAction: 'finance',
      };
    case 'Cancelado':
      return {
        title: 'Evento cancelado',
        description: 'Podés reabrir como cotización si el cliente vuelve.',
        primaryLabel: 'Reactivar a Cotizado',
        primaryAction: 'status:Cotizado',
      };
    default:
      return null;
  }
}
