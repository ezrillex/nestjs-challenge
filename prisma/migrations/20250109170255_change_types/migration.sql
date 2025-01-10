/*
  Warnings:

  - You are about to alter the column `price` on the `ProductVariations` table. The data in that column could be lost. The data in that column will be cast from `Money` to `DoublePrecision`.

*/
-- AlterTable
ALTER TABLE "ProductVariations" ALTER COLUMN "price" SET DATA TYPE DOUBLE PRECISION;
