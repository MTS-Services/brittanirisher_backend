/*
  Warnings:

  - A unique constraint covering the columns `[vendorId,blockedDate]` on the table `vendor_availabilities` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "vendor_availabilities" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "note" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "blockedDate" SET DATA TYPE TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "vendor_availabilities_vendorId_blockedDate_key" ON "vendor_availabilities"("vendorId", "blockedDate");
