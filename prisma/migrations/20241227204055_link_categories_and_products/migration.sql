-- AlterTable
ALTER TABLE "ProductVariations" ADD COLUMN     "last_updated_at" TIMESTAMP,
ADD COLUMN     "last_updated_by" UUID;
