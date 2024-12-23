-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "failed_login_attempts_timestamps" TIMESTAMP(3)[] DEFAULT ARRAY[]::TIMESTAMP(3)[];
