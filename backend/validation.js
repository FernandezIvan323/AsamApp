export const ALLOWED_STATUSES = ['Pendiente', 'Aprobado', 'Realizado', 'Cancelado'];

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function optionalText(value) {
  const text = normalizeText(value);
  return text || null;
}

function nonNegativeNumber(value, field, errors) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) {
    errors.push(`${field} debe ser un numero mayor o igual a 0`);
    return 0;
  }
  return number;
}

function validateDate(value, errors) {
  const date = optionalText(value);
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    errors.push('date debe tener formato YYYY-MM-DD');
  }
  return date;
}

function validateTime(value, errors) {
  const time = optionalText(value);
  if (time && !/^\d{2}:\d{2}$/.test(time)) {
    errors.push('time debe tener formato HH:mm');
  }
  return time;
}

export function validateStatusPayload(payload) {
  const status = normalizeText(payload?.status);
  if (!ALLOWED_STATUSES.includes(status)) {
    return {
      errors: [`status debe ser uno de: ${ALLOWED_STATUSES.join(', ')}`],
      data: null,
    };
  }

  return { errors: [], data: { status } };
}

export function validateCatalogPayload(payload) {
  const errors = [];
  const name = normalizeText(payload?.name);
  const unit = normalizeText(payload?.unit);
  const price = nonNegativeNumber(payload?.price, 'price', errors);

  if (!name) errors.push('name es requerido');
  if (!unit) errors.push('unit es requerido');

  return {
    errors,
    data: errors.length ? null : { name, unit, price },
  };
}

export function validateEventPayload(payload) {
  const errors = [];
  const title = normalizeText(payload?.title);
  const guests = nonNegativeNumber(payload?.guests, 'guests', errors);
  const extraCosts = nonNegativeNumber(payload?.extraCosts ?? 0, 'extraCosts', errors);
  const profitMargin = nonNegativeNumber(payload?.profitMargin ?? 0, 'profitMargin', errors);
  const date = validateDate(payload?.date, errors);
  const time = validateTime(payload?.time, errors);
  const insumosPayload = Array.isArray(payload?.insumos) ? payload.insumos : [];

  if (!title) errors.push('title es requerido');
  if (!Number.isInteger(guests)) errors.push('guests debe ser un numero entero');

  const insumos = insumosPayload.map((item, index) => {
    const name = normalizeText(item?.name);
    const unit = normalizeText(item?.unit);
    const quantity = nonNegativeNumber(item?.quantity, `insumos[${index}].quantity`, errors);
    const costPerUnit = nonNegativeNumber(item?.costPerUnit, `insumos[${index}].costPerUnit`, errors);

    if (!name) errors.push(`insumos[${index}].name es requerido`);
    if (!unit) errors.push(`insumos[${index}].unit es requerido`);

    return {
      name,
      quantity,
      unit,
      costPerUnit,
      totalCost: quantity * costPerUnit,
    };
  });

  const subtotal = insumos.reduce((total, item) => total + item.totalCost, 0) + extraCosts;
  const totalPrice = subtotal * (1 + (profitMargin / 100));

  return {
    errors,
    data: errors.length ? null : {
      title,
      client: optionalText(payload?.client),
      date,
      time,
      location: optionalText(payload?.location),
      guests,
      status: 'Pendiente',
      extraCosts,
      profitMargin,
      totalPrice,
      insumos,
    },
  };
}
