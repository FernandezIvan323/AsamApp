export function required(value, label) {
  if (!value && value !== 0) return `${label} es obligatorio`;
  if (typeof value === 'string' && !value.trim()) return `${label} es obligatorio`;
  return null;
}

export function minLength(value, min, label) {
  if (value && value.trim().length < min) return `${label} debe tener al menos ${min} caracteres`;
  return null;
}

export function min(value, minVal, label) {
  const num = Number(value);
  if (value !== '' && value !== null && value !== undefined && num < minVal) {
    return `${label} debe ser mayor o igual a ${minVal}`;
  }
  return null;
}

export function positive(value, label) {
  const num = Number(value);
  if (value === '' || value === null || value === undefined) return `${label} es obligatorio`;
  if (!Number.isFinite(num) || num < 0) return `${label} debe ser un número válido (≥ 0)`;
  return null;
}

export function dateRequired(value, label = 'La fecha') {
  if (!value || !String(value).trim()) return `${label} es obligatoria`;
  return null;
}

export function validate(rules) {
  const errors = {};
  for (const [field, fns] of Object.entries(rules)) {
    for (const fn of Array.isArray(fns) ? fns : [fns]) {
      const err = fn();
      if (err) { errors[field] = err; break; }
    }
  }
  return errors;
}

/** Validación estándar de presupuesto/evento. */
export function validateEventForm(values) {
  return validate({
    eventName: () => required(values.eventName, 'El nombre del evento'),
    eventDate: () => dateRequired(values.eventDate, 'La fecha'),
    adults: () => {
      if (values.adults === '' || values.adults === null || values.adults === undefined) return null;
      return min(values.adults, 0, 'Adultos');
    },
  });
}
