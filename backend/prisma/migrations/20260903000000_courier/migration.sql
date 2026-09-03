ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'COURIER';

ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "lat" DOUBLE PRECISION;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "lng" DOUBLE PRECISION;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "courierId" TEXT;

CREATE INDEX IF NOT EXISTS "Order_courierId_idx" ON "Order"("courierId");
CREATE INDEX IF NOT EXISTS "Order_status_idx" ON "Order"("status");

CREATE TABLE IF NOT EXISTS "CourierApplication" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL UNIQUE,
  "fullName" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "vehicle" TEXT NOT NULL,
  "message" TEXT NOT NULL DEFAULT '',
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "rejectReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reviewedAt" TIMESTAMP(3)
);

CREATE INDEX IF NOT EXISTS "CourierApplication_status_idx" ON "CourierApplication"("status");

DO $$ BEGIN
  ALTER TABLE "CourierApplication"
    ADD CONSTRAINT "CourierApplication_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
