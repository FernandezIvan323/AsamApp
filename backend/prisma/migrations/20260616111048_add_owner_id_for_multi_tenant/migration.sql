-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CatalogItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "stock" REAL NOT NULL DEFAULT 0,
    "minStock" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "ownerId" TEXT,
    CONSTRAINT "CatalogItem_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_CatalogItem" ("createdAt", "id", "minStock", "name", "price", "stock", "unit", "updatedAt") SELECT "createdAt", "id", "minStock", "name", "price", "stock", "unit", "updatedAt" FROM "CatalogItem";
DROP TABLE "CatalogItem";
ALTER TABLE "new_CatalogItem" RENAME TO "CatalogItem";
CREATE TABLE "new_EventChangeLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "field" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ownerId" TEXT,
    "eventId" TEXT NOT NULL,
    CONSTRAINT "EventChangeLog_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "EventChangeLog_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_EventChangeLog" ("createdAt", "eventId", "field", "id", "newValue", "oldValue") SELECT "createdAt", "eventId", "field", "id", "newValue", "oldValue" FROM "EventChangeLog";
DROP TABLE "EventChangeLog";
ALTER TABLE "new_EventChangeLog" RENAME TO "EventChangeLog";
CREATE TABLE "new_EventPayment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "paidAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" REAL NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ownerId" TEXT,
    "eventId" TEXT NOT NULL,
    CONSTRAINT "EventPayment_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "EventPayment_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_EventPayment" ("amount", "createdAt", "eventId", "id", "notes", "paidAt", "paymentMethod") SELECT "amount", "createdAt", "eventId", "id", "notes", "paidAt", "paymentMethod" FROM "EventPayment";
DROP TABLE "EventPayment";
ALTER TABLE "new_EventPayment" RENAME TO "EventPayment";
CREATE TABLE "new_EventPhoto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "caption" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ownerId" TEXT,
    "eventId" TEXT NOT NULL,
    CONSTRAINT "EventPhoto_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "EventPhoto_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_EventPhoto" ("caption", "createdAt", "data", "eventId", "filename", "id", "mimeType", "size") SELECT "caption", "createdAt", "data", "eventId", "filename", "id", "mimeType", "size" FROM "EventPhoto";
DROP TABLE "EventPhoto";
ALTER TABLE "new_EventPhoto" RENAME TO "EventPhoto";
CREATE TABLE "new_EventTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "dueDate" TEXT,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "ownerId" TEXT,
    "eventId" TEXT NOT NULL,
    CONSTRAINT "EventTask_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "EventTask_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_EventTask" ("createdAt", "done", "dueDate", "eventId", "id", "title", "updatedAt") SELECT "createdAt", "done", "dueDate", "eventId", "id", "title", "updatedAt" FROM "EventTask";
DROP TABLE "EventTask";
ALTER TABLE "new_EventTask" RENAME TO "EventTask";
CREATE TABLE "new_FixedCost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "frequency" TEXT NOT NULL DEFAULT 'Mensual',
    "category" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "ownerId" TEXT,
    CONSTRAINT "FixedCost_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_FixedCost" ("amount", "category", "createdAt", "frequency", "id", "name", "notes", "updatedAt") SELECT "amount", "category", "createdAt", "frequency", "id", "name", "notes", "updatedAt" FROM "FixedCost";
DROP TABLE "FixedCost";
ALTER TABLE "new_FixedCost" RENAME TO "FixedCost";
CREATE TABLE "new_Insumo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "costPerUnit" REAL NOT NULL,
    "totalCost" REAL NOT NULL,
    "ownerId" TEXT,
    "eventId" TEXT NOT NULL,
    CONSTRAINT "Insumo_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Insumo_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Insumo" ("costPerUnit", "eventId", "id", "name", "quantity", "totalCost", "unit") SELECT "costPerUnit", "eventId", "id", "name", "quantity", "totalCost", "unit" FROM "Insumo";
DROP TABLE "Insumo";
ALTER TABLE "new_Insumo" RENAME TO "Insumo";
CREATE TABLE "new_MarketPurchase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "purchasedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "store" TEXT NOT NULL,
    "vendorName" TEXT,
    "vendorPhone" TEXT,
    "paymentMethod" TEXT NOT NULL,
    "totalAmount" REAL NOT NULL DEFAULT 0,
    "notes" TEXT,
    "receiptPhotos" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "ownerId" TEXT,
    "eventId" TEXT,
    "providerId" TEXT,
    CONSTRAINT "MarketPurchase_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "MarketPurchase_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "MarketPurchase_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_MarketPurchase" ("createdAt", "eventId", "id", "notes", "paymentMethod", "providerId", "purchasedAt", "receiptPhotos", "store", "totalAmount", "updatedAt", "vendorName", "vendorPhone") SELECT "createdAt", "eventId", "id", "notes", "paymentMethod", "providerId", "purchasedAt", "receiptPhotos", "store", "totalAmount", "updatedAt", "vendorName", "vendorPhone" FROM "MarketPurchase";
DROP TABLE "MarketPurchase";
ALTER TABLE "new_MarketPurchase" RENAME TO "MarketPurchase";
CREATE TABLE "new_MarketPurchaseItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "unitPrice" REAL NOT NULL,
    "subtotal" REAL NOT NULL,
    "ownerId" TEXT,
    "purchaseId" TEXT NOT NULL,
    CONSTRAINT "MarketPurchaseItem_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "MarketPurchaseItem_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "MarketPurchase" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_MarketPurchaseItem" ("id", "name", "purchaseId", "quantity", "subtotal", "unit", "unitPrice") SELECT "id", "name", "purchaseId", "quantity", "subtotal", "unit", "unitPrice" FROM "MarketPurchaseItem";
DROP TABLE "MarketPurchaseItem";
ALTER TABLE "new_MarketPurchaseItem" RENAME TO "MarketPurchaseItem";
CREATE TABLE "new_NoteChangeLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "field" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "ownerId" TEXT,
    "noteId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "NoteChangeLog_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "NoteChangeLog_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_NoteChangeLog" ("createdAt", "field", "id", "newValue", "noteId", "oldValue") SELECT "createdAt", "field", "id", "newValue", "noteId", "oldValue" FROM "NoteChangeLog";
DROP TABLE "NoteChangeLog";
ALTER TABLE "new_NoteChangeLog" RENAME TO "NoteChangeLog";
CREATE TABLE "new_Provider" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "category" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "ownerId" TEXT,
    CONSTRAINT "Provider_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Provider" ("category", "createdAt", "id", "name", "notes", "phone", "updatedAt") SELECT "category", "createdAt", "id", "name", "notes", "phone", "updatedAt" FROM "Provider";
DROP TABLE "Provider";
ALTER TABLE "new_Provider" RENAME TO "Provider";
CREATE TABLE "new_QuoteTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "guests" INTEGER NOT NULL DEFAULT 0,
    "extraCosts" REAL NOT NULL DEFAULT 0,
    "profitMargin" REAL NOT NULL DEFAULT 0,
    "menuNotes" TEXT,
    "recipeName" TEXT,
    "itemsJson" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "ownerId" TEXT,
    CONSTRAINT "QuoteTemplate_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_QuoteTemplate" ("createdAt", "description", "extraCosts", "guests", "id", "itemsJson", "menuNotes", "name", "profitMargin", "recipeName", "updatedAt") SELECT "createdAt", "description", "extraCosts", "guests", "id", "itemsJson", "menuNotes", "name", "profitMargin", "recipeName", "updatedAt" FROM "QuoteTemplate";
DROP TABLE "QuoteTemplate";
ALTER TABLE "new_QuoteTemplate" RENAME TO "QuoteTemplate";
CREATE TABLE "new_RecipeCombo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "servings" INTEGER NOT NULL DEFAULT 0,
    "basePrice" REAL NOT NULL DEFAULT 0,
    "itemsJson" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "ownerId" TEXT,
    CONSTRAINT "RecipeCombo_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_RecipeCombo" ("basePrice", "category", "createdAt", "description", "id", "itemsJson", "name", "servings", "updatedAt") SELECT "basePrice", "category", "createdAt", "description", "id", "itemsJson", "name", "servings", "updatedAt" FROM "RecipeCombo";
DROP TABLE "RecipeCombo";
ALTER TABLE "new_RecipeCombo" RENAME TO "RecipeCombo";
CREATE TABLE "new_StockMovement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ownerId" TEXT,
    "catalogItemId" TEXT NOT NULL,
    CONSTRAINT "StockMovement_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "StockMovement_catalogItemId_fkey" FOREIGN KEY ("catalogItemId") REFERENCES "CatalogItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_StockMovement" ("catalogItemId", "createdAt", "id", "notes", "quantity", "type") SELECT "catalogItemId", "createdAt", "id", "notes", "quantity", "type" FROM "StockMovement";
DROP TABLE "StockMovement";
ALTER TABLE "new_StockMovement" RENAME TO "StockMovement";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

