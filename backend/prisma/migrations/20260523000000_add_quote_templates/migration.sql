-- CreateTable
CREATE TABLE "QuoteTemplate" (
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
    "updatedAt" DATETIME NOT NULL
);
