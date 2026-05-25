ALTER TABLE "MarketPurchase" ADD COLUMN "vendorName" TEXT;
ALTER TABLE "MarketPurchase" ADD COLUMN "vendorPhone" TEXT;
ALTER TABLE "MarketPurchase" ADD COLUMN "receiptPhotos" TEXT NOT NULL DEFAULT '[]';
