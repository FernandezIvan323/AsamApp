import test from 'node:test';
import assert from 'node:assert/strict';
import {
  EVENT_STATUSES,
  assertStatusTransition,
  getAllowedStatuses,
  normalizeStatus,
} from './eventStatus.js';

test('EVENT_STATUSES no incluye Pendiente', () => {
  assert.ok(!EVENT_STATUSES.includes('Pendiente'));
  assert.ok(EVENT_STATUSES.includes('Cotizado'));
});

test('normalizeStatus mapea Pendiente a Cotizado', () => {
  assert.equal(normalizeStatus('Pendiente'), 'Cotizado');
  assert.equal(normalizeStatus('Aprobado'), 'Aprobado');
});

test('getAllowedStatuses desde Cotizado', () => {
  const allowed = getAllowedStatuses('Cotizado');
  assert.deepEqual(allowed, ['Cotizado', 'Aprobado', 'Cancelado']);
});

test('getAllowedStatuses desde Realizado solo Cobrado', () => {
  assert.deepEqual(getAllowedStatuses('Realizado'), ['Realizado', 'Cobrado']);
});

test('getAllowedStatuses Cobrado no avanza', () => {
  assert.deepEqual(getAllowedStatuses('Cobrado'), ['Cobrado']);
});

test('assertStatusTransition permite Aprobado desde Cotizado', () => {
  assert.equal(assertStatusTransition('Cotizado', 'Aprobado').ok, true);
});

test('assertStatusTransition rechaza Cotizado a Cobrado', () => {
  const result = assertStatusTransition('Cotizado', 'Cobrado');
  assert.equal(result.ok, false);
  assert.match(result.error, /no permitida/i);
});

test('assertStatusTransition permite mismo estado', () => {
  assert.equal(assertStatusTransition('Aprobado', 'Aprobado').ok, true);
});

test('assertStatusTransition desde Pendiente legacy a Aprobado', () => {
  assert.equal(assertStatusTransition('Pendiente', 'Aprobado').ok, true);
});
