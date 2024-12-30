/*
  Warnings:

  - The values [succeded] on the enum `PaymentStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PaymentStatus_new" AS ENUM ('pending_creation', 'requires_payment_method', 'requires_confirmation', 'requires_action', 'processing', 'succeeded', 'canceled');
ALTER TABLE "Orders" ALTER COLUMN "paymentStatus" DROP DEFAULT;
ALTER TABLE "PaymentIntents" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Orders" ALTER COLUMN "paymentStatus" TYPE "PaymentStatus_new" USING ("paymentStatus"::text::"PaymentStatus_new");
ALTER TABLE "PaymentIntents" ALTER COLUMN "status" TYPE "PaymentStatus_new" USING ("status"::text::"PaymentStatus_new");
ALTER TYPE "PaymentStatus" RENAME TO "PaymentStatus_old";
ALTER TYPE "PaymentStatus_new" RENAME TO "PaymentStatus";
DROP TYPE "PaymentStatus_old";
ALTER TABLE "Orders" ALTER COLUMN "paymentStatus" SET DEFAULT 'pending_creation';
ALTER TABLE "PaymentIntents" ALTER COLUMN "status" SET DEFAULT 'pending_creation';
COMMIT;
