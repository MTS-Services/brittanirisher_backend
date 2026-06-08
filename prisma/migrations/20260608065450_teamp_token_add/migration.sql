/*
  Warnings:

  - A unique constraint covering the columns `[tempAuthToken]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "tempAuthToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_tempAuthToken_key" ON "User"("tempAuthToken");
