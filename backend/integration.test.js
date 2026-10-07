import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';
import path from 'path';
import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testDbPath = path.join(__dirname, 'test-integration.db');

let app;
let prisma;
let authModule;
let server;
let baseUrl;

test.before(async () => {
  process.env.DATABASE_URL = `file:${testDbPath}`;
  process.env.AUTH_ENABLED = 'false';
  process.env.AUTH_SECRET = 'integration-test-secret';

  if (existsSync(testDbPath)) rmSync(testDbPath);
  execSync('npx prisma migrate deploy', { cwd: __dirname, stdio: 'pipe', env: process.env });

  const mod = await import('./server.js');
  app = mod.app;
  prisma = mod.prisma;
  authModule = await import('./auth.js');

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

test('GET /api/health responde ok', async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.status, 'ok');
});

test('flujo crear evento, duplicar y lista de compras', async () => {
  const createRes = await fetch(`${baseUrl}/api/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Integration Test',
      date: '2026-07-01',
      guests: 20,
      status: 'Aprobado',
      extraCosts: 0,
      profitMargin: 10,
      insumos: [{ name: 'Carne', unit: 'kg', quantity: 5, costPerUnit: 1000 }],
    }),
  });
  assert.equal(createRes.status, 201);
  const created = await createRes.json();
  assert.equal(created.title, 'Integration Test');

  const dupRes = await fetch(`${baseUrl}/api/events/${created.id}/duplicate`, { method: 'POST' });
  assert.equal(dupRes.status, 201);
  const copy = await dupRes.json();
  assert.ok(copy.title.includes('copia'));

  const listRes = await fetch(`${baseUrl}/api/shopping-list`);
  assert.equal(listRes.status, 200);
  const list = await listRes.json();
  assert.ok(list.items.some(item => item.name === 'Carne'));
});

test('auth rechaza API sin token cuando esta habilitada', async () => {
  process.env.AUTH_ENABLED = 'true';

  await prisma.user.deleteMany({ where: { username: 'integrationtest' } });
  await prisma.user.create({
    data: {
      email: 'itest@example.com',
      username: 'integrationtest',
      password: await import('crypto').then(({ scryptSync, randomBytes }) => {
        const salt = randomBytes(16).toString('hex');
        return `${salt}:${scryptSync('secret', salt, 64).toString('hex')}`;
      }),
      role: 'admin',
    },
  });

  const blocked = await fetch(`${baseUrl}/api/events`);
  assert.equal(blocked.status, 401);

  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'integrationtest', password: 'secret' }),
  });
  assert.equal(loginRes.status, 200);
  const { token } = await loginRes.json();
  assert.ok(token);

  const ok = await fetch(`${baseUrl}/api/events`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(ok.status, 200);

  await prisma.user.deleteMany({ where: { username: 'integrationtest' } });
  process.env.AUTH_ENABLED = 'false';
});

test('POST /api/users crea un usuario correctamente', async () => {
  await prisma.user.deleteMany({ where: { username: 'createduser' } });

  const invalid = await fetch(`${baseUrl}/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'created@example.com', username: 'createduser', password: 'short', role: 'viewer' }),
  });
  assert.equal(invalid.status, 400);

  const res = await fetch(`${baseUrl}/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'created@example.com', username: 'createduser', password: 'password-valido-123', role: 'viewer' }),
  });
  assert.equal(res.status, 201);
  const user = await res.json();
  assert.equal(user.username, 'createduser');
  assert.equal(user.role, 'viewer');
  assert.ok(user.id);
  assert.ok(!user.password, 'la respuesta no debe incluir el hash de la contraseña');

  const dbUser = await prisma.user.findUnique({ where: { username: 'createduser' } });
  assert.ok(dbUser.password.includes(':'), 'el password debe estar hasheado como salt:hash');

  await prisma.user.deleteMany({ where: { username: 'createduser' } });
});

test('PUT parcial de evento no borra campos existentes', async () => {
  const createRes = await fetch(`${baseUrl}/api/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Evento completo',
      date: '2026-10-15',
      time: '20:00',
      location: 'Calle 5',
      guests: 30,
      extraCosts: 1000,
      profitMargin: 25,
      insumos: [{ name: 'Carne', unit: 'kg', quantity: 10, costPerUnit: 20000 }],
    }),
  });
  assert.equal(createRes.status, 201);
  const created = await createRes.json();
  assert.equal(created.date, '2026-10-15');
  assert.equal(created.insumos.length, 1);

  const putRes = await fetch(`${baseUrl}/api/events/${created.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Solo cambia el titulo' }),
  });
  assert.equal(putRes.status, 200);
  const updated = await putRes.json();
  assert.equal(updated.title, 'Solo cambia el titulo');
  assert.equal(updated.date, '2026-10-15', 'la fecha no debe perderse');
  assert.equal(updated.time, '20:00', 'la hora no debe perderse');
  assert.equal(updated.location, 'Calle 5', 'la ubicacion no debe perderse');
  assert.equal(updated.guests, 30, 'los invitados no deben perderse');
  assert.equal(updated.insumos.length, 1, 'los insumos no deben perderse');
  assert.equal(updated.totalPrice, created.totalPrice, 'el total no debe cambiar');

  await fetch(`${baseUrl}/api/events/${created.id}`, { method: 'DELETE' });
});

test('POST/PUT con status invalido devuelve 400', async () => {
  const createRes = await fetch(`${baseUrl}/api/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Status invalido',
      guests: 10,
      extraCosts: 0,
      profitMargin: 0,
      status: 'EstadoInexistente',
      insumos: [],
    }),
  });
  assert.equal(createRes.status, 400);
  const createBody = await createRes.json();
  assert.ok(createBody.error.includes('status'));
});

test('registrar y eliminar pago recalcula amountPaid', async () => {
  const createRes = await fetch(`${baseUrl}/api/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Evento con pagos',
      guests: 10,
      extraCosts: 0,
      profitMargin: 100,
      amountPaid: 0,
      insumos: [{ name: 'Carne', unit: 'kg', quantity: 1, costPerUnit: 1000 }],
    }),
  });
  const event = await createRes.json();
  assert.equal(event.totalPrice, 2000);

  const payRes = await fetch(`${baseUrl}/api/events/${event.id}/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: 500, paymentMethod: 'Efectivo' }),
  });
  assert.equal(payRes.status, 201);
  const payment = await payRes.json();

  const pay2Res = await fetch(`${baseUrl}/api/events/${event.id}/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: 250, paymentMethod: 'Transferencia' }),
  });
  assert.equal(pay2Res.status, 201);

  let detail = await (await fetch(`${baseUrl}/api/events/${event.id}`)).json();
  assert.equal(detail.amountPaid, 750, 'amountPaid debe ser la suma de los pagos');

  const delRes = await fetch(`${baseUrl}/api/events/${event.id}/payments/${payment.id}`, { method: 'DELETE' });
  assert.equal(delRes.status, 204);

  detail = await (await fetch(`${baseUrl}/api/events/${event.id}`)).json();
  assert.equal(detail.amountPaid, 250, 'eliminar un pago debe recalcular amountPaid');

  await fetch(`${baseUrl}/api/events/${event.id}`, { method: 'DELETE' });
});
