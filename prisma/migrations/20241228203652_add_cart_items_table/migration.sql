-- CreateTable
CREATE TABLE "CartItems" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "product_variation_id" UUID,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "CartItems_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CartItems_user_id_product_variation_id_key" ON "CartItems"("user_id", "product_variation_id");

-- AddForeignKey
ALTER TABLE "CartItems" ADD CONSTRAINT "CartItems_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItems" ADD CONSTRAINT "CartItems_product_variation_id_fkey" FOREIGN KEY ("product_variation_id") REFERENCES "ProductVariations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
