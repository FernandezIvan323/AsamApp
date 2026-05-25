ALTER TABLE "Event" ADD COLUMN "menuNotes" TEXT;
ALTER TABLE "Event" ADD COLUMN "recipeName" TEXT;
ALTER TABLE "Event" ADD COLUMN "amountPaid" REAL NOT NULL DEFAULT 0;

ALTER TABLE "CatalogItem" ADD COLUMN "stock" REAL NOT NULL DEFAULT 0;
ALTER TABLE "CatalogItem" ADD COLUMN "minStock" REAL NOT NULL DEFAULT 0;

CREATE TABLE "Provider" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "category" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

ALTER TABLE "MarketPurchase" ADD COLUMN "eventId" TEXT REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MarketPurchase" ADD COLUMN "providerId" TEXT REFERENCES "Provider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "RecipeCombo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "servings" INTEGER NOT NULL DEFAULT 0,
    "basePrice" REAL NOT NULL DEFAULT 0,
    "itemsJson" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "EventTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "dueDate" TEXT,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "eventId" TEXT NOT NULL,
    CONSTRAINT "EventTask_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "EventPayment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "paidAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" REAL NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eventId" TEXT NOT NULL,
    CONSTRAINT "EventPayment_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "StockMovement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "catalogItemId" TEXT NOT NULL,
    CONSTRAINT "StockMovement_catalogItemId_fkey" FOREIGN KEY ("catalogItemId") REFERENCES "CatalogItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
