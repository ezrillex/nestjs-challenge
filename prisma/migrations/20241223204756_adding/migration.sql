-- CreateEnum
CREATE TYPE "roles" AS ENUM ('customer', 'manager', 'admin', 'anonymous');

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "role" "roles" NOT NULL DEFAULT 'customer';
