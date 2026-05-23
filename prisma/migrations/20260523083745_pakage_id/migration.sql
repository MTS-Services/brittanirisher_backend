/*
  Warnings:

  - You are about to drop the column `packageName` on the `vendor_bookings` table. All the data in the column will be lost.
  - Added the required column `packageId` to the `vendor_bookings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "vendor_bookings" DROP COLUMN "packageName",
ADD COLUMN     "packageId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "vendor_bookings" ADD CONSTRAINT "vendor_bookings_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "vendor_packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
