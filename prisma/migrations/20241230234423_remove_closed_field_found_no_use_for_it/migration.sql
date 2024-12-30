/*
  Warnings:

  - You are about to drop the column `confirmed` on the `PaymentIntents` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PaymentIntents" DROP COLUMN "confirmed";
