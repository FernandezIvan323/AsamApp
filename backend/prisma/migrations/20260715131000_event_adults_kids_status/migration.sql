-- AlterTable: invitados desglosados + status default Cotizado
-- SQLite: agregar columnas y migrar datos legacy

ALTER TABLE "Event" ADD COLUMN "adults" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Event" ADD COLUMN "kids" INTEGER NOT NULL DEFAULT 0;

-- Eventos viejos: todo el guests cuenta como adultos
UPDATE "Event" SET "adults" = "guests", "kids" = 0 WHERE "adults" = 0 AND "kids" = 0 AND "guests" > 0;

-- Unificar estado Pendiente → Cotizado
UPDATE "Event" SET "status" = 'Cotizado' WHERE "status" = 'Pendiente';
