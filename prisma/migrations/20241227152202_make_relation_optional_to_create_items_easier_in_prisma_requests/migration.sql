-- DropForeignKey
ALTER TABLE "Images" DROP CONSTRAINT "Images_product_variation_id_fkey";

-- DropForeignKey
ALTER TABLE "ProductVariations" DROP CONSTRAINT "ProductVariations_product_id_fkey";

-- AlterTable
ALTER TABLE "Images" ALTER COLUMN "product_variation_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ProductVariations" ALTER COLUMN "product_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ProductVariations" ADD CONSTRAINT "ProductVariations_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Images" ADD CONSTRAINT "Images_product_variation_id_fkey" FOREIGN KEY ("product_variation_id") REFERENCES "ProductVariations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
