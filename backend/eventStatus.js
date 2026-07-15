/** Workflow de estados de evento — fuente de verdad del backend. */

export const EVENT_STATUSES = [
  'Cotizado',
  'Aprobado',
  'Compras pendientes',
  'En preparacion',
  'Realizado',
  'Cobrado',
  'Cancelado',
];

/** Estados legacy que se tratan como Cotizado para transiciones. */
const LEGACY_ALIASES = {
  Pendiente: 'Cotizado',
};

export const STATUS_TRANSITIONS = {
  Cotizado: ['Aprobado', 'Cancelado'],
  Aprobado: ['Compras pendientes', 'En preparacion', 'Cancelado'],
  'Compras pendientes': ['En preparacion', 'Cancelado'],
  'En preparacion': ['Realizado', 'Cancelado'],
  Realizado: ['Cobrado'],
  Cobrado: [],
  Cancelado: ['Cotizado'],
};

export function normalizeStatus(status) {
  if (!status) return status;
  return LEGACY_ALIASES[status] || status;
}

export function getAllowedStatuses(currentStatus) {
  const normalized = normalizeStatus(currentStatus);
  const next = STATUS_TRANSITIONS[normalized] ?? [];
  // Si el valor crudo era legacy, ofrecer también el estado normalizado
  const current = currentStatus && !EVENT_STATUSES.includes(currentStatus)
    ? normalized
    : currentStatus;
  const list = [current, ...next].filter(Boolean);
  return [...new Set(list)];
}

/**
 * @returns {{ ok: true } | { ok: false, error: string }}
 */
export function assertStatusTransition(fromStatus, toStatus) {
  if (fromStatus === toStatus) return { ok: true };

  const from = normalizeStatus(fromStatus);
  const to = normalizeStatus(toStatus);

  if (!EVENT_STATUSES.includes(to)) {
    return { ok: false, error: `Estado destino no válido: ${toStatus}` };
  }

  // Migrar legacy Pendiente → Cotizado se permite siempre
  if (fromStatus === 'Pendiente' && to === 'Cotizado') return { ok: true };

  const allowed = STATUS_TRANSITIONS[from] ?? [];
  if (!allowed.includes(to)) {
    return {
      ok: false,
      error: `Transición de estado no permitida: "${fromStatus}" → "${toStatus}"`,
    };
  }
  return { ok: true };
}
