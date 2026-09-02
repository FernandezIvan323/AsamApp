import test from 'node:test';
import assert from 'node:assert/strict';
import { signToken, verifyToken, isAuthEnabled } from './auth.js';
import { createRateLimiter, clientIp, resetBuckets } from './rate-limit.js';

function mockReq({ ip = '1.2.3.4', body = {} } = {}) {
  return { ip, headers: {}, socket: { remoteAddress: ip }, body };
}

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

test('createRateLimiter permite hasta max y luego bloquea con 429', () => {
  resetBuckets();
  const limiter = createRateLimiter({
    windowMs: 60_000,
    max: 3,
    keyGenerator: () => 'test-key',
    message: 'Bloqueado',
  });

  let nextCount = 0;
  const next = () => { nextCount += 1; };

  for (let i = 0; i < 3; i += 1) {
    limiter(mockReq({ ip: '9.9.9.9' }), {}, next);
  }
  assert.equal(nextCount, 3);

  let blocked = false;
  let retryAfter = null;
  const res = {
    setHeader: () => {},
    status(code) {
      if (code === 429) blocked = true;
      return this;
    },
    json(payload) {
      if (payload?.retryAfter) retryAfter = payload.retryAfter;
      return this;
    },
  };
  res.setHeader = (_name, value) => { if (_name === 'Retry-After') retryAfter = Number(value); };

  limiter(mockReq({ ip: '9.9.9.9' }), res, next);
  assert.equal(blocked, true);
  assert.equal(nextCount, 3, 'next no debe llamarse cuando se bloquea');
  assert.ok(retryAfter > 0, 'retryAfter debe ser positivo');
});

test('createRateLimiter cuenta por IP+username independiente', () => {
  resetBuckets();
  const limiter = createRateLimiter({
    windowMs: 60_000,
    max: 2,
    keyGenerator: (req) => `k:${clientIp(req)}|${(req.body?.username || '')}`,
  });

  let nextCount = 0;
  const next = () => { nextCount += 1; };

  limiter(mockReq({ ip: '5.5.5.5', body: { username: 'alice' } }), {}, next);
  limiter(mockReq({ ip: '5.5.5.5', body: { username: 'alice' } }), {}, next);
  limiter(mockReq({ ip: '5.5.5.5', body: { username: 'bob' } }), {}, next);

  assert.equal(nextCount, 3, 'otro usuario con misma IP debe contar separado');
});

test('clientIp respeta x-forwarded-for', () => {
  const req = { headers: { 'x-forwarded-for': '10.0.0.1, 10.0.0.2' }, ip: '127.0.0.1' };
  assert.equal(clientIp(req), '10.0.0.1');
});
