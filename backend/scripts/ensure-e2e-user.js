#!/usr/bin/env node
/**
 * Crea o actualiza el usuario E2E usado por Playwright.
 * Uso: node scripts/ensure-e2e-user.js [username] [password]
 */
import 'dotenv/config';
import { hashPassword } from '../auth.js';
import { prisma } from '../db.js';

if (process.env.NODE_ENV === 'production' && process.env.E2E_ALLOW_PROD !== '1') {
  console.error('[e2e] Rehusando correr contra NODE_ENV=production (setea E2E_ALLOW_PROD=1 para forzar)');
  process.exit(1);
}

const username = process.argv[2] || process.env.E2E_USER || 'e2e_workflow';
const password = process.argv[3] || process.env.E2E_PASSWORD || 'e2e-pass-AsamApp1';
const email = process.env.E2E_EMAIL || `${username}@e2e.local`;

const hashed = hashPassword(password);
const existing = await prisma.user.findUnique({ where: { username } });

if (existing) {
  await prisma.user.update({
    where: { id: existing.id },
    data: { password: hashed, active: true, role: 'admin' },
  });
  console.log(`[e2e] Usuario actualizado: ${username}`);
} else {
  await prisma.user.create({
    data: {
      username,
      email,
      password: hashed,
      role: 'admin',
      active: true,
    },
  });
  console.log(`[e2e] Usuario creado: ${username}`);
}

await prisma.$disconnect();
