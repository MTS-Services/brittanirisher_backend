/*
  Warnings:

  - A unique constraint covering the columns `[currentSubscriptionId]` on the table `vendor_profiles` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "vendor_profiles_currentSubscriptionId_key" ON "vendor_profiles"("currentSubscriptionId");

-- AddForeignKey
ALTER TABLE "vendor_profiles" ADD CONSTRAINT "vendor_profiles_currentSubscriptionId_fkey" FOREIGN KEY ("currentSubscriptionId") REFERENCES "vendor_subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
