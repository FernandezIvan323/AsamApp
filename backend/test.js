import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateCatalogPayload,
  validateEventPayload,
  validateStatusPayload,
} from './validation.js';

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
