-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "password_reset_requests" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "password_reset_requests_timestamps" TIMESTAMP(3)[] DEFAULT ARRAY[]::TIMESTAMP(3)[],
ADD COLUMN     "password_reset_token" TEXT;
