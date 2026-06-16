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
  if (value !== '' && num < minVal) return `${label} debe ser mayor o igual a ${minVal}`;
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
