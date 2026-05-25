CREATE TABLE "MarketPurchase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "purchasedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "store" TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "totalAmount" REAL NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "MarketPurchaseItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "unitPrice" REAL NOT NULL,
    "subtotal" REAL NOT NULL,
    "purchaseId" TEXT NOT NULL,
    CONSTRAINT "MarketPurchaseItem_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "MarketPurchase" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
