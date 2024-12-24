/*
  Warnings:

  - You are about to drop the column `last_login_at` on the `Users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Users" DROP COLUMN "last_login_at",
ADD COLUMN     "login_at" TIMESTAMP(3),
ADD COLUMN     "logout_at" TIMESTAMP(3);
