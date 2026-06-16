export const ALLOWED_STATUSES = ['Cotizado', 'Aprobado', 'Compras pendientes', 'En preparacion', 'Realizado', 'Cobrado', 'Cancelado', 'Pendiente'];
export const PAYMENT_METHODS = ['Efectivo', 'Tarjeta', 'Transferencia', 'Otro'];

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

function validateDateTime(value, errors) {
  const text = optionalText(value);
  if (!text) return new Date();

  const date = new Date(text);
  if (Number.isNaN(date.getTime())) {
    errors.push('purchasedAt debe ser una fecha y hora valida');
    return new Date();
  }
  return date;
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
  const stock = nonNegativeNumber(payload?.stock ?? 0, 'stock', errors);
  const minStock = nonNegativeNumber(payload?.minStock ?? 0, 'minStock', errors);

  if (!name) errors.push('name es requerido');
  if (!unit) errors.push('unit es requerido');

  return {
    errors,
    data: errors.length ? null : { name, unit, price, stock, minStock },
  };
}

export function validateEventPayload(payload) {
  const errors = [];
  const title = normalizeText(payload?.title);
  const guests = nonNegativeNumber(payload?.guests, 'guests', errors);
  const extraCosts = nonNegativeNumber(payload?.extraCosts ?? 0, 'extraCosts', errors);
  const profitMargin = nonNegativeNumber(payload?.profitMargin ?? 0, 'profitMargin', errors);
  const amountPaid = nonNegativeNumber(payload?.amountPaid ?? 0, 'amountPaid', errors);
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
      clientId: optionalText(payload?.clientId) || null,
      date,
      time,
      location: optionalText(payload?.location),
      guests,
      status: ALLOWED_STATUSES.includes(normalizeText(payload?.status)) ? normalizeText(payload?.status) : 'Cotizado',
      menuNotes: optionalText(payload?.menuNotes),
      recipeName: optionalText(payload?.recipeName),
      extraCosts,
      profitMargin,
      amountPaid,
      totalPrice,
      insumos,
    },
  };
}

export function validateMarketPurchasePayload(payload) {
  const errors = [];
  const purchasedAt = validateDateTime(payload?.purchasedAt, errors);
  const store = normalizeText(payload?.store);
  const vendorName = optionalText(payload?.vendorName);
  const vendorPhone = optionalText(payload?.vendorPhone);
  const eventId = optionalText(payload?.eventId);
  const providerId = optionalText(payload?.providerId);
  const paymentMethod = normalizeText(payload?.paymentMethod) || 'Efectivo';
  const notes = optionalText(payload?.notes);
  const itemsPayload = Array.isArray(payload?.items) ? payload.items : [];
  const receiptPhotosPayload = Array.isArray(payload?.receiptPhotos) ? payload.receiptPhotos : [];

  if (!store) errors.push('store es requerido');
  if (!PAYMENT_METHODS.includes(paymentMethod)) {
    errors.push(`paymentMethod debe ser uno de: ${PAYMENT_METHODS.join(', ')}`);
  }
  if (itemsPayload.length === 0) errors.push('items debe contener al menos un producto');

  const items = itemsPayload.map((item, index) => {
    const name = normalizeText(item?.name);
    const unit = normalizeText(item?.unit) || 'unidad';
    const quantity = nonNegativeNumber(item?.quantity, `items[${index}].quantity`, errors);
    const unitPrice = nonNegativeNumber(item?.unitPrice, `items[${index}].unitPrice`, errors);

    if (!name) errors.push(`items[${index}].name es requerido`);
    if (quantity <= 0) errors.push(`items[${index}].quantity debe ser mayor a 0`);

    return {
      name,
      quantity,
      unit,
      unitPrice,
      subtotal: quantity * unitPrice,
    };
  });

  const totalAmount = items.reduce((total, item) => total + item.subtotal, 0);
  const receiptPhotos = receiptPhotosPayload
    .filter(photo => typeof photo === 'string' && photo.startsWith('data:image/'))
    .slice(0, 6);

  return {
    errors,
    data: errors.length ? null : {
      purchasedAt,
      store,
      vendorName,
      vendorPhone,
      eventId,
      providerId,
      paymentMethod,
      notes,
      receiptPhotos: JSON.stringify(receiptPhotos),
      totalAmount,
      items,
    },
  };
}

export function validateProviderPayload(payload) {
  const errors = [];
  const name = normalizeText(payload?.name);
  if (!name) errors.push('name es requerido');

  return {
    errors,
    data: errors.length ? null : {
      name,
      phone: optionalText(payload?.phone),
      category: optionalText(payload?.category),
      notes: optionalText(payload?.notes),
    },
  };
}

export function validateRecipePayload(payload) {
  const errors = [];
  const name = normalizeText(payload?.name);
  const servings = nonNegativeNumber(payload?.servings ?? 0, 'servings', errors);
  const basePrice = nonNegativeNumber(payload?.basePrice ?? 0, 'basePrice', errors);
  const items = Array.isArray(payload?.items) ? payload.items : [];

  if (!name) errors.push('name es requerido');
  if (!Number.isInteger(servings)) errors.push('servings debe ser un numero entero');

  const cleanItems = items.map((item, index) => {
    const label = normalizeText(item?.name);
    const quantity = nonNegativeNumber(item?.quantity ?? 0, `items[${index}].quantity`, errors);
    const unit = normalizeText(item?.unit) || 'unidad';
    if (!label) errors.push(`items[${index}].name es requerido`);
    return { name: label, quantity, unit };
  });

  return {
    errors,
    data: errors.length ? null : {
      name,
      category: optionalText(payload?.category),
      description: optionalText(payload?.description),
      servings,
      basePrice,
      itemsJson: JSON.stringify(cleanItems),
    },
  };
}

export function validateTaskPayload(payload) {
  const errors = [];
  const title = normalizeText(payload?.title);
  if (!title) errors.push('title es requerido');

  return {
    errors,
    data: errors.length ? null : {
      title,
      dueDate: validateDate(payload?.dueDate, errors),
      done: Boolean(payload?.done),
    },
  };
}

export function validatePaymentPayload(payload) {
  const errors = [];
  const amount = nonNegativeNumber(payload?.amount, 'amount', errors);
  const paymentMethod = normalizeText(payload?.paymentMethod) || 'Efectivo';
  const paidAt = validateDateTime(payload?.paidAt, errors);
  if (amount <= 0) errors.push('amount debe ser mayor a 0');
  if (!PAYMENT_METHODS.includes(paymentMethod)) {
    errors.push(`paymentMethod debe ser uno de: ${PAYMENT_METHODS.join(', ')}`);
  }

  return {
    errors,
    data: errors.length ? null : {
      amount,
      paymentMethod,
      paidAt,
      notes: optionalText(payload?.notes),
    },
  };
}

export function validateQuoteTemplatePayload(payload) {
  const errors = [];
  const name = normalizeText(payload?.name);
  const guests = nonNegativeNumber(payload?.guests ?? 0, 'guests', errors);
  const extraCosts = nonNegativeNumber(payload?.extraCosts ?? 0, 'extraCosts', errors);
  const profitMargin = nonNegativeNumber(payload?.profitMargin ?? 0, 'profitMargin', errors);
  const items = Array.isArray(payload?.items) ? payload.items : [];

  if (!name) errors.push('name es requerido');
  if (!Number.isInteger(guests)) errors.push('guests debe ser un numero entero');

  const cleanItems = items.map((item, index) => {
    const label = normalizeText(item?.name);
    const quantity = nonNegativeNumber(item?.quantity ?? 0, `items[${index}].quantity`, errors);
    const unit = normalizeText(item?.unit) || 'unidad';
    const costPerUnit = nonNegativeNumber(item?.costPerUnit ?? 0, `items[${index}].costPerUnit`, errors);
    if (!label) errors.push(`items[${index}].name es requerido`);
    return { name: label, quantity, unit, costPerUnit };
  });

  return {
    errors,
    data: errors.length ? null : {
      name,
      description: optionalText(payload?.description),
      guests,
      extraCosts,
      profitMargin,
      menuNotes: optionalText(payload?.menuNotes),
      recipeName: optionalText(payload?.recipeName),
      itemsJson: JSON.stringify(cleanItems),
    },
  };
}

export function validateStockMovementPayload(payload) {
  const errors = [];
  const type = normalizeText(payload?.type);
  const quantity = nonNegativeNumber(payload?.quantity, 'quantity', errors);
  if (!['Entrada', 'Salida', 'Ajuste'].includes(type)) errors.push('type debe ser Entrada, Salida o Ajuste');
  if (quantity <= 0) errors.push('quantity debe ser mayor a 0');

  return {
    errors,
    data: errors.length ? null : {
      type,
      quantity,
      notes: optionalText(payload?.notes),
    },
  };
}
