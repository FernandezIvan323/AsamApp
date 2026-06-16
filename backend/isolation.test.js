import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';
import path from 'path';
import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testDbPath = path.join(__dirname, 'test-isolation.db');

let app, prisma, authModule, server, baseUrl;
let tokenA, tokenB, tokenAdmin;
let eventIdA, eventIdB;

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

test.before(async () => {
  process.env.DATABASE_URL = `file:${testDbPath}`;
  process.env.AUTH_ENABLED = 'true';
  process.env.AUTH_SECRET = 'isolation-test-secret';

  if (existsSync(testDbPath)) rmSync(testDbPath);
  execSync('npx prisma migrate deploy', { cwd: __dirname, stdio: 'pipe', env: process.env });

  const mod = await import('./server.js');
  app = mod.app;
  prisma = mod.prisma;
  authModule = await import('./auth.js');

  await prisma.user.create({
    data: { email: 'admin@test.com', username: 'admin1', password: hashPassword('pass1234'), role: 'admin' },
  });

  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await prisma.$disconnect();
  if (authModule?.prisma) await authModule.prisma.$disconnect();
});

async function registerUser(username) {
  const res = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email: `${username}@test.com`, password: 'pass1234' }),
  });
  const body = await res.json();
  return body.token;
}

async function api(url, options = {}) {
  const headers = { ...options.headers };
  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }
  return fetch(`${baseUrl}${url}`, { ...options, headers });
}

test('registro y login de usuarios', async () => {
  tokenA = await registerUser('usera');
  tokenB = await registerUser('userb');

  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin1', password: 'pass1234' }),
  });
  const loginBody = await loginRes.json();
  tokenAdmin = loginBody.token;

  assert.ok(tokenA);
  assert.ok(tokenAdmin);
  assert.ok(tokenB);
});

test('usuario A crea evento y solo ve los propios', async () => {
  const res = await api('/api/events', {
    method: 'POST',
    token: tokenA,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Evento A', guests: 10, extraCosts: 0, profitMargin: 0, insumos: [] }),
  });
  assert.equal(res.status, 201);
  eventIdA = (await res.json()).id;

  const listRes = await api('/api/events', { token: tokenA });
  const events = await listRes.json();
  assert.equal(events.length, 1);
  assert.equal(events[0].title, 'Evento A');
});

test('usuario B no ve eventos de A', async () => {
  const res = await api('/api/events', { token: tokenB });
  const events = await res.json();
  assert.equal(events.length, 0);
});

test('usuario B no puede acceder al evento de A por ID', async () => {
  const res = await api(`/api/events/${eventIdA}`, { token: tokenB });
  assert.equal(res.status, 404);
});

test('usuario B no puede actualizar evento de A', async () => {
  const res = await api(`/api/events/${eventIdA}`, {
    method: 'PUT',
    token: tokenB,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Hackeado', guests: 10, extraCosts: 0, profitMargin: 0, insumos: [] }),
  });
  assert.equal(res.status, 404);
});

test('usuario B no puede eliminar evento de A', async () => {
  const res = await api(`/api/events/${eventIdA}`, {
    method: 'DELETE',
    token: tokenB,
  });
  assert.equal(res.status, 404);
});

test('admin ve todos los eventos', async () => {
  eventIdB = await api('/api/events', {
    method: 'POST',
    token: tokenB,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Evento B', guests: 5, extraCosts: 0, profitMargin: 0, insumos: [] }),
  }).then(r => r.json()).then(b => b.id);

  const res = await api('/api/events', { token: tokenAdmin });
  const events = await res.json();
  assert.ok(events.length >= 2);
});

test('aislamiento en inventario', async () => {
  const resA = await api('/api/inventory', {
    method: 'POST',
    token: tokenA,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Item A', unit: 'kg', price: 100, stock: 10, minStock: 1 }),
  });
  assert.equal(resA.status, 201);

  const listB = await api('/api/inventory', { token: tokenB });
  const itemsB = await listB.json();
  assert.equal(itemsB.length, 0);

  const listAdmin = await api('/api/inventory', { token: tokenAdmin });
  const itemsAdmin = await listAdmin.json();
  assert.ok(itemsAdmin.length >= 1);
});

test('aislamiento en proveedores', async () => {
  const resA = await api('/api/providers', {
    method: 'POST',
    token: tokenA,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Proveedor A', phone: '123456789', category: 'Carnes' }),
  });
  assert.equal(resA.status, 201);

  const listB = await api('/api/providers', { token: tokenB });
  const providersB = await listB.json();
  assert.equal(providersB.length, 0);
});

test('aislamiento en notas', async () => {
  const resA = await api('/api/notes', {
    method: 'POST',
    token: tokenA,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Nota A', content: 'Privada', priority: 'Media', type: 'Recordatorio' }),
  });
  assert.equal(resA.status, 201);

  const listB = await api('/api/notes', { token: tokenB });
  const notesB = await listB.json();
  assert.equal(notesB.length, 0);
});

test('aislamiento en recetas', async () => {
  const resA = await api('/api/recipes', {
    method: 'POST',
    token: tokenA,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Receta A', basePrice: 200 }),
  });
  assert.equal(resA.status, 201);

  const listB = await api('/api/recipes', { token: tokenB });
  const recipesB = await listB.json();
  assert.equal(recipesB.length, 0);
});

test('aislamiento en compras de mercado', async () => {
  const resA = await api('/api/market-purchases', {
    method: 'POST',
    token: tokenA,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      store: 'Tienda A',
      paymentMethod: 'Efectivo',
      totalAmount: 500,
      purchasedAt: new Date().toISOString(),
      items: [{ name: 'Item A', quantity: 2, unit: 'kg', unitPrice: 250, subtotal: 500 }],
    }),
  });
  assert.equal(resA.status, 201);

  const listB = await api('/api/market-purchases', { token: tokenB });
  const purchasesB = await listB.json();
  assert.equal(purchasesB.length, 0);
});

test('aislamiento en gastos fijos', async () => {
  const resA = await api('/api/fixed-costs', {
    method: 'POST',
    token: tokenA,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Gasto A', amount: 1000, frequency: 'Mensual' }),
  });
  assert.equal(resA.status, 201);

  const listB = await api('/api/fixed-costs', { token: tokenB });
  const costsB = await listB.json();
  assert.equal(costsB.length, 0);
});

test('aislamiento en plantillas de presupuesto', async () => {
  const resA = await api('/api/quote-templates', {
    method: 'POST',
    token: tokenA,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Template A', description: 'Test' }),
  });
  assert.equal(resA.status, 201);

  const listB = await api('/api/quote-templates', { token: tokenB });
  const templatesB = await listB.json();
  assert.equal(templatesB.length, 0);
});
