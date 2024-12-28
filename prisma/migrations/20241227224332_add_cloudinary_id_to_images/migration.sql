/*
  Warnings:

  - Added the required column `cdn_id` to the `Images` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Images" DROP CONSTRAINT "Images_product_variation_id_fkey";

-- DropForeignKey
ALTER TABLE "ProductVariations" DROP CONSTRAINT "ProductVariations_product_id_fkey";

-- AlterTable
ALTER TABLE "Images" ADD COLUMN     "cdn_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "ProductVariations" ADD CONSTRAINT "ProductVariations_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Images" ADD CONSTRAINT "Images_product_variation_id_fkey" FOREIGN KEY ("product_variation_id") REFERENCES "ProductVariations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
