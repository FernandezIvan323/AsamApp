#!/usr/bin/env node
import 'dotenv/config';
import { hashPassword } from '../auth.js';
import { prisma } from '../db.js';

const username = process.argv[2];
const newPassword = process.argv[3];
const newRole = process.argv[4];

if (!username || !newPassword) {
  console.error('Uso: node reset-password.js <username> <nueva-password> [rol]');
  console.error('  rol opcional: admin | editor | viewer');
  process.exit(1);
}

if (newPassword.length < 8) {
  console.error('La contraseña debe tener al menos 8 caracteres');
  process.exit(1);
}

const user = await prisma.user.findUnique({ where: { username } });
if (!user) {
  console.error(`No existe el usuario "${username}"`);
  process.exit(1);
}

const data = {
  password: hashPassword(newPassword),
  active: true,
};
if (newRole) data.role = newRole;

await prisma.user.update({ where: { id: user.id }, data });
console.log(`OK: "${username}" -> password reseteada${newRole ? `, rol = ${newRole}` : ` (rol actual: ${user.role})`}`);
await prisma.$disconnect();
