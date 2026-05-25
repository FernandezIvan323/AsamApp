import test from 'node:test';
import assert from 'node:assert/strict';
import { signToken, verifyToken, isAuthEnabled } from './auth.js';

test('signToken y verifyToken validan credenciales', () => {
  process.env.AUTH_SECRET = 'test-secret';
  const token = signToken('admin');
  assert.equal(verifyToken(token), 'admin');
  assert.equal(verifyToken('token-invalido'), null);
});

test('isAuthEnabled respeta variable de entorno', () => {
  process.env.AUTH_ENABLED = 'true';
  assert.equal(isAuthEnabled(), true);
  process.env.AUTH_ENABLED = 'false';
  assert.equal(isAuthEnabled(), false);
});
