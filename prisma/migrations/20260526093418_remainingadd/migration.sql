/*
  Warnings:

  - Made the column `budget` on table `couple_profiles` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "VendorStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "couple_profiles" ADD COLUMN     "expendBudget" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "remainingBudget" DECIMAL(10,2) NOT NULL DEFAULT 0,
ALTER COLUMN "budget" SET NOT NULL;

-- AlterTable
ALTER TABLE "vendor_profiles" ADD COLUMN     "status" "VendorStatus" NOT NULL DEFAULT 'PENDING';
