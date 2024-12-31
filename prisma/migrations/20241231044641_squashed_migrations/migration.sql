-- CreateEnum
CREATE TYPE "roles" AS ENUM ('public', 'customer', 'manager', 'admin');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('requires_capture', 'pending_creation', 'requires_payment_method', 'requires_confirmation', 'requires_action', 'processing', 'succeeded', 'canceled');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('awaiting_payment', 'pending_fulfillment', 'fulfillment_in_progress', 'shipped', 'delivered', 'delivery_cancelled', 'returned');

-- CreateEnum
CREATE TYPE "BackgroundJobStatus" AS ENUM ('pending', 'locked', 'processing', 'success', 'error');

-- CreateTable
CREATE TABLE "Testing" (
    "id" TEXT NOT NULL,
    "test" TEXT NOT NULL,

    CONSTRAINT "Testing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Users" (
    "id" UUID NOT NULL,
    "first_name" VARCHAR(60) NOT NULL,
    "last_name" VARCHAR(120) NOT NULL,
    "email" TEXT NOT NULL,
    "password" CHAR(60) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" "roles" NOT NULL DEFAULT 'customer',
    "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
    "failed_login_attempts_timestamps" TIMESTAMP(3)[] DEFAULT ARRAY[]::TIMESTAMP(3)[],
    "session_token" TEXT,
    "login_at" TIMESTAMP,
    "logout_at" TIMESTAMP,
    "password_reset_requests" INTEGER NOT NULL DEFAULT 0,
    "password_reset_requests_timestamps" TIMESTAMP(3)[] DEFAULT ARRAY[]::TIMESTAMP(3)[],
    "password_reset_token" TEXT,
    "password_last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Products" (
    "id" UUID NOT NULL,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_updated_by" UUID,
    "last_updated_at" TIMESTAMP,

    CONSTRAINT "Products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVariations" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "price" MONEY NOT NULL,
    "stock" INTEGER NOT NULL,
    "product_id" UUID,
    "last_updated_by" UUID,
    "last_updated_at" TIMESTAMP,

    CONSTRAINT "ProductVariations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LikesOfProducts" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "product_variation_id" UUID,

    CONSTRAINT "LikesOfProducts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Images" (
    "id" UUID NOT NULL,
    "cdn_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "product_variation_id" UUID,

    CONSTRAINT "Images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartItems" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "product_variation_id" UUID,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "CartItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Orders" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'pending_creation',
    "orderStatus" "OrderStatus" NOT NULL DEFAULT 'awaiting_payment',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItems" (
    "id" UUID NOT NULL,
    "order_id" UUID,
    "product_variation_id" UUID,
    "quantity" INTEGER NOT NULL,
    "price_purchased_at" DECIMAL NOT NULL,

    CONSTRAINT "OrderItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentIntents" (
    "id" UUID NOT NULL,
    "order_id" UUID,
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending_creation',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stripe_event_id" TEXT,
    "stripe_payment_intent" JSON,

    CONSTRAINT "PaymentIntents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncomingPaymentWebhooks" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "data" JSON NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP,

    CONSTRAINT "IncomingPaymentWebhooks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CategoriesToProducts" (
    "A" TEXT NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_CategoriesToProducts_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Categories_name_key" ON "Categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "LikesOfProducts_user_id_product_variation_id_key" ON "LikesOfProducts"("user_id", "product_variation_id");

-- CreateIndex
CREATE UNIQUE INDEX "CartItems_user_id_product_variation_id_key" ON "CartItems"("user_id", "product_variation_id");

-- CreateIndex
CREATE INDEX "_CategoriesToProducts_B_index" ON "_CategoriesToProducts"("B");

-- AddForeignKey
ALTER TABLE "ProductVariations" ADD CONSTRAINT "ProductVariations_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LikesOfProducts" ADD CONSTRAINT "LikesOfProducts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LikesOfProducts" ADD CONSTRAINT "LikesOfProducts_product_variation_id_fkey" FOREIGN KEY ("product_variation_id") REFERENCES "ProductVariations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Images" ADD CONSTRAINT "Images_product_variation_id_fkey" FOREIGN KEY ("product_variation_id") REFERENCES "ProductVariations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItems" ADD CONSTRAINT "CartItems_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItems" ADD CONSTRAINT "CartItems_product_variation_id_fkey" FOREIGN KEY ("product_variation_id") REFERENCES "ProductVariations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItems" ADD CONSTRAINT "OrderItems_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItems" ADD CONSTRAINT "OrderItems_product_variation_id_fkey" FOREIGN KEY ("product_variation_id") REFERENCES "ProductVariations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentIntents" ADD CONSTRAINT "PaymentIntents_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncomingPaymentWebhooks" ADD CONSTRAINT "IncomingPaymentWebhooks_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoriesToProducts" ADD CONSTRAINT "_CategoriesToProducts_A_fkey" FOREIGN KEY ("A") REFERENCES "Categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoriesToProducts" ADD CONSTRAINT "_CategoriesToProducts_B_fkey" FOREIGN KEY ("B") REFERENCES "Products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
