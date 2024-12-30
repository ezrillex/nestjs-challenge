/*
  Warnings:

  - You are about to drop the column `status` on the `IncomingPaymentWebhooks` table. All the data in the column will be lost.
  - Made the column `order_id` on table `IncomingPaymentWebhooks` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "IncomingPaymentWebhooks" DROP CONSTRAINT "IncomingPaymentWebhooks_order_id_fkey";

-- AlterTable
ALTER TABLE "IncomingPaymentWebhooks" DROP COLUMN "status",
ALTER COLUMN "order_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "IncomingPaymentWebhooks" ADD CONSTRAINT "IncomingPaymentWebhooks_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
