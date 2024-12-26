/*
  Warnings:

  - The values [anonymous] on the enum `roles` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "roles_new" AS ENUM ('customer', 'manager', 'admin');
ALTER TABLE "Users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "Users" ALTER COLUMN "role" TYPE "roles_new" USING ("role"::text::"roles_new");
ALTER TYPE "roles" RENAME TO "roles_old";
ALTER TYPE "roles_new" RENAME TO "roles";
DROP TYPE "roles_old";
ALTER TABLE "Users" ALTER COLUMN "role" SET DEFAULT 'customer';
COMMIT;

-- AlterTable
ALTER TABLE "ProductVariations" ADD COLUMN     "images" UUID[];
