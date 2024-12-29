-- AlterTable
ALTER TABLE "Orders" ADD COLUMN     "orderStatus" "OrderStatus" NOT NULL DEFAULT 'awaiting_payment';
