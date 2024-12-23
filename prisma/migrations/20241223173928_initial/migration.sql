-- CreateTable
CREATE TABLE "Testing" (
    "id" TEXT NOT NULL,
    "test" TEXT NOT NULL,

    CONSTRAINT "Testing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" CHAR(32) NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");
