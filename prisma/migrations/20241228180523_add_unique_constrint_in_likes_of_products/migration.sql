/*
  Warnings:

  - A unique constraint covering the columns `[user_id,product_variation_id]` on the table `LikesOfProducts` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "LikesOfProducts_user_id_product_variation_id_key" ON "LikesOfProducts"("user_id", "product_variation_id");
