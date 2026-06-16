#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';
import { runBackup } from './backup-db.js';

const prisma = new PrismaClient();

const MODELS = [
  'Event', 'Note', 'CatalogItem', 'MarketPurchase', 'MarketPurchaseItem',
  'Provider', 'RecipeCombo', 'EventTask', 'EventPayment', 'StockMovement',
  'NoteChangeLog', 'QuoteTemplate', 'EventChangeLog', 'FixedCost',
  'EventPhoto', 'Insumo',
];

async function main() {
  console.log('=== Multi-Tenant Migration v2.0.0 ===\n');

  const backup = runBackup();
  if (!backup.ok) {
    console.error(`[ERROR] Respaldo fallido: ${backup.message}`);
    process.exit(1);
  }
  console.log(`[OK] Respaldo creado: ${backup.file}\n`);

  const admin = await prisma.user.findFirst({
    where: { role: 'admin', active: true },
    orderBy: { createdAt: 'asc' },
  });

  if (!admin) {
    console.error('[ERROR] No se encontró ningún usuario admin activo.');
    console.error('  Crea uno con: node scripts/reset-password.js <user> <pass> admin');
    process.exit(1);
  }
  console.log(`[OK] Admin fundador: ${admin.username} (${admin.id})\n`);

  let totalUpdated = 0;
  for (const model of MODELS) {
    const rawModel = model.charAt(0).toLowerCase() + model.slice(1);
    const count = await prisma[rawModel].count({
      where: { ownerId: null },
    });
    if (count === 0) {
      console.log(`  ${model}: 0 huérfanos (todo ok)`);
      continue;
    }
    await prisma.$executeRawUnsafe(
      `UPDATE "${model}" SET "ownerId" = ? WHERE "ownerId" IS NULL`,
      admin.id,
    );
    console.log(`  ${model}: ${count} registro(s) asignado(s)`);
    totalUpdated += count;
  }

  console.log(`\n=== Migración completada: ${totalUpdated} registros actualizados ===`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});
