import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateCatalogPayload,
  validateEventPayload,
  validateMarketPurchasePayload,
  validatePaymentPayload,
  validateProviderPayload,
  validateQuoteTemplatePayload,
  validateRecipePayload,
  validateStatusPayload,
  validateStockMovementPayload,
  validateTaskPayload,
} from './validation.js';
import { buildShoppingList, getEventFinancialSummary } from './shoppingList.js';
import { eventsToCsv } from './exportData.js';

test('validateEventPayload normaliza y recalcula el total del presupuesto', () => {
  const result = validateEventPayload({
    title: ' Cumpleanos ',
    date: '2026-05-20',
    guests: 10,
    extraCosts: 500,
    profitMargin: 20,
    totalPrice: 1,
    insumos: [
      { name: 'Carne', unit: 'kg', quantity: 2, costPerUnit: 1000, totalCost: 1 },
    ],
  });

  assert.deepEqual(result.errors, []);
  assert.equal(result.data.title, 'Cumpleanos');
  assert.equal(result.data.totalPrice, 3000);
  assert.equal(result.data.insumos[0].totalCost, 2000);
});

test('validateEventPayload rechaza datos incompletos o negativos', () => {
  const result = validateEventPayload({
    title: '',
    guests: -1,
    extraCosts: -5,
    profitMargin: 10,
  });

  assert.ok(result.errors.length >= 3);
  assert.equal(result.data, null);
});

test('validateStatusPayload solo acepta estados conocidos', () => {
  assert.deepEqual(validateStatusPayload({ status: 'Aprobado' }).errors, []);
  assert.ok(validateStatusPayload({ status: 'Otro' }).errors.length > 0);
});

test('validateCatalogPayload exige nombre, unidad y precio valido', () => {
  assert.deepEqual(validateCatalogPayload({ name: 'Carbon', unit: 'bolsa', price: 12000 }).errors, []);
  assert.ok(validateCatalogPayload({ name: '', unit: '', price: -1 }).errors.length >= 3);
});

test('validateMarketPurchasePayload recalcula subtotales y total de compra', () => {
  const result = validateMarketPurchasePayload({
    purchasedAt: '2026-05-21T14:30:00.000Z',
    store: 'Carniceria',
    paymentMethod: 'Efectivo',
    items: [
      { name: 'Carne', quantity: 2, unit: 'kg', unitPrice: 15000, subtotal: 1 },
      { name: 'Verduras', quantity: 3, unit: 'unidad', unitPrice: 2000 },
    ],
  });

  assert.deepEqual(result.errors, []);
  assert.equal(result.data.totalAmount, 36000);
  assert.equal(result.data.items[0].subtotal, 30000);
});

test('validateMarketPurchasePayload exige tienda y productos validos', () => {
  const result = validateMarketPurchasePayload({
    store: '',
    paymentMethod: 'Cheque',
    items: [{ name: '', quantity: 0, unitPrice: -1 }],
  });

  assert.ok(result.errors.length >= 5);
  assert.equal(result.data, null);
});

test('validateTaskPayload acepta tareas con fecha opcional', () => {
  const result = validateTaskPayload({ title: ' Comprar carbon ', dueDate: '2026-06-01', done: false });
  assert.deepEqual(result.errors, []);
  assert.equal(result.data.title, 'Comprar carbon');
});

test('validatePaymentPayload exige monto positivo y metodo valido', () => {
  assert.deepEqual(validatePaymentPayload({ amount: 5000, paymentMethod: 'Transferencia' }).errors, []);
  assert.ok(validatePaymentPayload({ amount: 0, paymentMethod: 'Cheque' }).errors.length > 0);
});

test('validateStockMovementPayload acepta entrada salida y ajuste', () => {
  assert.deepEqual(validateStockMovementPayload({ type: 'Entrada', quantity: 10 }).errors, []);
  assert.ok(validateStockMovementPayload({ type: 'Otro', quantity: 1 }).errors.length > 0);
});

test('validateProviderPayload y validateRecipePayload normalizan datos', () => {
  const provider = validateProviderPayload({ name: ' Carniceria ' });
  assert.deepEqual(provider.errors, []);
  assert.equal(provider.data.name, 'Carniceria');

  const recipe = validateRecipePayload({
    name: 'Combo',
    servings: 20,
    items: [{ name: 'Carne', quantity: 2, unit: 'kg' }],
  });
  assert.deepEqual(recipe.errors, []);
  assert.equal(JSON.parse(recipe.data.itemsJson).length, 1);
});

test('validateStatusPayload incluye todos los estados del workflow', () => {
  for (const status of ['Cotizado', 'Compras pendientes', 'En preparacion', 'Cobrado']) {
    assert.deepEqual(validateStatusPayload({ status }).errors, []);
  }
});

test('buildShoppingList consolida insumos de eventos por estado', () => {
  const result = buildShoppingList([
    {
      id: '1',
      title: 'Asado A',
      status: 'Aprobado',
      date: '2026-06-01',
      client: 'Juan',
      insumos: [{ name: 'Carne', unit: 'kg', quantity: 5 }],
    },
    {
      id: '2',
      title: 'Asado B',
      status: 'Aprobado',
      date: '2026-06-02',
      client: null,
      insumos: [{ name: 'Carne', unit: 'kg', quantity: 3 }, { name: 'Carbon', unit: 'bolsa', quantity: 2 }],
    },
  ]);

  assert.equal(result.events.length, 2);
  assert.equal(result.items.length, 2);
  const carne = result.items.find(item => item.name === 'Carne');
  assert.equal(carne.quantity, 8);
  assert.deepEqual(carne.eventTitles, ['Asado A', 'Asado B']);
});

test('validateQuoteTemplatePayload guarda items en json', () => {
  const result = validateQuoteTemplatePayload({
    name: 'Asado estandar',
    guests: 30,
    profitMargin: 25,
    items: [{ name: 'Carne', quantity: 10, unit: 'kg', costPerUnit: 1200 }],
  });
  assert.deepEqual(result.errors, []);
  assert.equal(JSON.parse(result.data.itemsJson).length, 1);
});

test('eventsToCsv genera encabezados y filas', () => {
  const csv = eventsToCsv([{ id: '1', title: 'Test', client: null, date: '2026-01-01', time: null, status: 'Aprobado', guests: 10, totalPrice: 100, amountPaid: 0, extraCosts: 0, profitMargin: 20 }]);
  assert.ok(csv.includes('title'));
  assert.ok(csv.includes('Test'));
});

test('getEventFinancialSummary calcula margen real', () => {
  const summary = getEventFinancialSummary({
    totalPrice: 100000,
    extraCosts: 0,
    amountPaid: 80000,
    insumos: [{ totalCost: 50000 }],
    purchases: [{ totalAmount: 45000 }],
  });

  assert.equal(summary.quotedCost, 50000);
  assert.equal(summary.realProfit, 35000);
  assert.equal(summary.costVariance, -5000);
  assert.equal(summary.laborCost, 0);
});

test('getEventFinancialSummary resta mano de obra', () => {
  const summary = getEventFinancialSummary({
    totalPrice: 100000,
    extraCosts: 0,
    amountPaid: 100000,
    insumos: [{ totalCost: 40000 }],
    purchases: [{ totalAmount: 30000 }],
    employeeActivities: [{ payment: 10000 }],
  });
  assert.equal(summary.laborCost, 10000);
  assert.equal(summary.realProfit, 60000);
});

test('validateEventPayload calcula guests desde adults y kids', () => {
  const result = validateEventPayload({
    title: 'Asado',
    date: '2026-07-20',
    adults: 20,
    kids: 4,
    insumos: [],
  });
  assert.deepEqual(result.errors, []);
  assert.equal(result.data.guests, 22); // ceil(20 + 2)
  assert.equal(result.data.adults, 20);
  assert.equal(result.data.kids, 4);
});
