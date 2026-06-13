/*
  Warnings:

  - A unique constraint covering the columns `[coupleProfileId,vendorId]` on the table `saved_vendors` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "couple_tasks_taskSectionId_createdAt_idx" ON "couple_tasks"("taskSectionId", "createdAt");

-- CreateIndex
CREATE INDEX "couple_timeline_tasks_coupleTimelineSectionId_createdAt_idx" ON "couple_timeline_tasks"("coupleTimelineSectionId", "createdAt");

-- CreateIndex
CREATE INDEX "enquiries_vendorId_status_idx" ON "enquiries"("vendorId", "status");

-- CreateIndex
CREATE INDEX "payments_vendorId_idx" ON "payments"("vendorId");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "saved_vendors_coupleProfileId_vendorId_key" ON "saved_vendors"("coupleProfileId", "vendorId");

-- CreateIndex
CREATE INDEX "vendor_bookings_vendorId_status_idx" ON "vendor_bookings"("vendorId", "status");

-- CreateIndex
CREATE INDEX "vendor_portfolios_vendorId_sortOrder_idx" ON "vendor_portfolios"("vendorId", "sortOrder");

-- CreateIndex
CREATE INDEX "vendor_profiles_status_isVerified_categoryId_idx" ON "vendor_profiles"("status", "isVerified", "categoryId");

-- CreateIndex
CREATE INDEX "vendor_profiles_stateId_cityId_idx" ON "vendor_profiles"("stateId", "cityId");

-- CreateIndex
CREATE INDEX "vendor_profiles_categoryId_idx" ON "vendor_profiles"("categoryId");

-- CreateIndex
CREATE INDEX "vendor_profiles_status_idx" ON "vendor_profiles"("status");

-- CreateIndex
CREATE INDEX "vendor_subscriptions_vendorId_status_idx" ON "vendor_subscriptions"("vendorId", "status");

-- CreateIndex
CREATE INDEX "wedding_day_schedules_coupleProfileId_idx" ON "wedding_day_schedules"("coupleProfileId");
