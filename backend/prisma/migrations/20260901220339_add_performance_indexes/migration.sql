-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "client" TEXT,
    "date" TEXT,
    "time" TEXT,
    "location" TEXT,
    "guests" INTEGER NOT NULL DEFAULT 0,
    "adults" INTEGER NOT NULL DEFAULT 0,
    "kids" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'Cotizado',
    "menuNotes" TEXT,
    "recipeName" TEXT,
    "extraCosts" REAL NOT NULL DEFAULT 0,
    "profitMargin" REAL NOT NULL DEFAULT 0,
    "totalPrice" REAL NOT NULL DEFAULT 0,
    "amountPaid" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "ownerId" TEXT,
    "clientId" TEXT,
    CONSTRAINT "Event_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Event_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Event" ("adults", "amountPaid", "client", "clientId", "createdAt", "date", "extraCosts", "guests", "id", "kids", "location", "menuNotes", "ownerId", "profitMargin", "recipeName", "status", "time", "title", "totalPrice", "updatedAt") SELECT "adults", "amountPaid", "client", "clientId", "createdAt", "date", "extraCosts", "guests", "id", "kids", "location", "menuNotes", "ownerId", "profitMargin", "recipeName", "status", "time", "title", "totalPrice", "updatedAt" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
CREATE INDEX "Event_ownerId_idx" ON "Event"("ownerId");
CREATE INDEX "Event_ownerId_status_idx" ON "Event"("ownerId", "status");
CREATE INDEX "Event_ownerId_date_idx" ON "Event"("ownerId", "date");
CREATE INDEX "Event_clientId_idx" ON "Event"("clientId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "CatalogItem_ownerId_idx" ON "CatalogItem"("ownerId");

-- CreateIndex
CREATE INDEX "EmployeeActivity_ownerId_idx" ON "EmployeeActivity"("ownerId");

-- CreateIndex
CREATE INDEX "EmployeeActivity_employeeId_idx" ON "EmployeeActivity"("employeeId");

-- CreateIndex
CREATE INDEX "EmployeeActivity_eventId_idx" ON "EmployeeActivity"("eventId");

-- CreateIndex
CREATE INDEX "EmployeeActivity_ownerId_date_idx" ON "EmployeeActivity"("ownerId", "date");

-- CreateIndex
CREATE INDEX "MarketPurchase_ownerId_idx" ON "MarketPurchase"("ownerId");

-- CreateIndex
CREATE INDEX "MarketPurchase_ownerId_purchasedAt_idx" ON "MarketPurchase"("ownerId", "purchasedAt");

-- CreateIndex
CREATE INDEX "MarketPurchase_eventId_idx" ON "MarketPurchase"("eventId");

-- CreateIndex
CREATE INDEX "MarketPurchase_providerId_idx" ON "MarketPurchase"("providerId");

-- CreateIndex
CREATE INDEX "Note_ownerId_idx" ON "Note"("ownerId");

-- CreateIndex
CREATE INDEX "Note_ownerId_archived_idx" ON "Note"("ownerId", "archived");

-- CreateIndex
CREATE INDEX "Note_ownerId_status_idx" ON "Note"("ownerId", "status");
