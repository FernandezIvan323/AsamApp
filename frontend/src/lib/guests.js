/**
 * Comensales efectivos: adultos = 1 ración, niños = ½ ración.
 * Se guarda como entero (ceil) para el campo guests del evento.
 */
export function effectiveGuests(adults, kids) {
  const a = Math.max(0, Number(adults) || 0);
  const k = Math.max(0, Number(kids) || 0);
  return Math.ceil(a + k * 0.5);
}

/** Valor decimal exacto para mostrar “equivalente”. */
export function effectiveGuestsExact(adults, kids) {
  const a = Math.max(0, Number(adults) || 0);
  const k = Math.max(0, Number(kids) || 0);
  return a + k * 0.5;
}

export function formatGuestSummary(adults, kids) {
  const a = Math.max(0, Number(adults) || 0);
  const k = Math.max(0, Number(kids) || 0);
  const eff = effectiveGuests(a, k);
  if (k === 0) return `${a} adulto${a !== 1 ? 's' : ''} · ${eff} raciones`;
  return `${a} adulto${a !== 1 ? 's' : ''} + ${k} niño${k !== 1 ? 's' : ''} · ${eff} raciones (½)`;
}
