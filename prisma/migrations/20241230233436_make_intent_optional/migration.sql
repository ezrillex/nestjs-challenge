/*
  Warnings:

  - You are about to drop the column `closed` on the `PaymentIntents` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PaymentIntents" DROP COLUMN "closed",
ALTER COLUMN "stripe_payment_intent" DROP NOT NULL;
