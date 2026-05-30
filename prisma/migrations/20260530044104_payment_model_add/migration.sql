/*
  Warnings:

  - A unique constraint covering the columns `[stripeSubscriptionId]` on the table `vendor_subscriptions` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "subscription_plans" ADD COLUMN     "stripePriceId" TEXT;

-- AlterTable
ALTER TABLE "vendor_subscriptions" ADD COLUMN     "stripeSubscriptionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "vendor_subscriptions_stripeSubscriptionId_key" ON "vendor_subscriptions"("stripeSubscriptionId");
