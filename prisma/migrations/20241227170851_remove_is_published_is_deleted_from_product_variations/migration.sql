/*
  Warnings:

  - You are about to drop the column `is_deleted` on the `ProductVariations` table. All the data in the column will be lost.
  - You are about to drop the column `is_published` on the `ProductVariations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ProductVariations" DROP COLUMN "is_deleted",
DROP COLUMN "is_published";
