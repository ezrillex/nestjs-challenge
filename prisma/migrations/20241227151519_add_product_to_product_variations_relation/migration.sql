/*
  Warnings:

  - The primary key for the `ProductVariations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `images` on the `ProductVariations` table. All the data in the column will be lost.
  - The primary key for the `Products` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `variations` on the `Products` table. All the data in the column will be lost.
  - Added the required column `product_id` to the `ProductVariations` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `ProductVariations` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Products` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "ProductVariations" DROP CONSTRAINT "ProductVariations_pkey",
DROP COLUMN "images",
ADD COLUMN     "product_id" UUID NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "ProductVariations_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Products" DROP CONSTRAINT "Products_pkey",
DROP COLUMN "variations",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "Products_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "Images" (
    "id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "product_variation_id" UUID NOT NULL,

    CONSTRAINT "Images_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProductVariations" ADD CONSTRAINT "ProductVariations_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Images" ADD CONSTRAINT "Images_product_variation_id_fkey" FOREIGN KEY ("product_variation_id") REFERENCES "ProductVariations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
