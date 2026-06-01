-- CreateEnum
CREATE TYPE "Role" AS ENUM ('COUPLE', 'VENDOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'PENDING_VERIFICATION', 'SUSPENDED', 'DEACTIVATED');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "OtpPurpose" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET', 'LOGIN_2FA');

-- CreateEnum
CREATE TYPE "VendorStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AvailabilityStatus" AS ENUM ('AVAILABLE', 'UNAVAILABLE', 'BOOKED');

-- CreateEnum
CREATE TYPE "EnquiryStatus" AS ENUM ('NEW', 'PENDING', 'REPLIED', 'IGNORED', 'CONTRACTED');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('SUCCESS', 'PENDING', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'BOOKED', 'COMPLETED', 'CANCELED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'COUPLE',
    "status" "AccountStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "profileStep" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtpToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "purpose" "OtpPurpose" NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtpToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeddingStyle" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeddingStyle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_plans" (
    "id" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "sortDescription" TEXT,
    "stripePriceId" TEXT,
    "validFor" TEXT,
    "priceMonthly" DECIMAL(10,2) NOT NULL,
    "portfolioLimit" INTEGER NOT NULL DEFAULT 10,
    "featuresAllowed" JSONB NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "couple_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3),
    "budget" DECIMAL(10,2) NOT NULL,
    "expendBudget" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "remainingBudget" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "weldingStyleId" TEXT,
    "weldingDate" TIMESTAMP(3),
    "estimatedGuests" INTEGER,
    "location" TEXT,
    "phone" TEXT,
    "profileImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "couple_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "couple_expenses" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "vendorName" TEXT,
    "vendorPhone" TEXT,
    "vendorEmail" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "coupleProfileId" TEXT NOT NULL,

    CONSTRAINT "couple_expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskSection" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "coupleProfileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaskSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "couple_tasks" (
    "id" TEXT NOT NULL,
    "milestoneTitle" TEXT NOT NULL,
    "taskName" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "taskSectionId" TEXT NOT NULL,

    CONSTRAINT "couple_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoupleTimelineSection" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "coupleProfileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoupleTimelineSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "couple_timeline_tasks" (
    "id" TEXT NOT NULL,
    "phaseTitle" TEXT,
    "taskName" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3),
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "taskNotes" TEXT,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "coupleTimelineSectionId" TEXT NOT NULL,

    CONSTRAINT "couple_timeline_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wedding_day_schedules" (
    "id" TEXT NOT NULL,
    "coupleProfileId" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wedding_day_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_vendors" (
    "id" TEXT NOT NULL,
    "coupleProfileId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "phone" TEXT,
    "highlightedServices" TEXT[],
    "experienceYears" TEXT,
    "speciality" TEXT,
    "aboutMe" TEXT,
    "coverImage" TEXT,
    "currentSubscriptionId" TEXT,
    "stripeCustomerId" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "VendorStatus" NOT NULL DEFAULT 'PENDING',
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "vendor_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_portfolios" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "mediaUrl" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_portfolios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_availabilities" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "blockedDate" TIMESTAMP(3) NOT NULL,
    "status" "AvailabilityStatus" NOT NULL DEFAULT 'BOOKED',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_availabilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enquiries" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "profileId" TEXT,
    "senderName" TEXT NOT NULL,
    "senderPhone" TEXT NOT NULL,
    "senderEmail" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "EnquiryStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_subscriptions" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stripeSubscriptionId" TEXT,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "PaymentStatus" NOT NULL DEFAULT 'SUCCESS',
    "stripeIntentId" TEXT,
    "purchaseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_packages" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "packageName" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "badge" TEXT,
    "shortDescription" TEXT,
    "features" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_bookings" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "coupleName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "venueName" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "weddingDate" TIMESTAMP(3) NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "packageId" TEXT NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'BOOKED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_status_idx" ON "User"("role", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Session_refreshToken_key" ON "Session"("refreshToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "OtpToken_userId_purpose_idx" ON "OtpToken"("userId", "purpose");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "WeddingStyle_name_key" ON "WeddingStyle"("name");

-- CreateIndex
CREATE UNIQUE INDEX "WeddingStyle_slug_key" ON "WeddingStyle"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "couple_profiles_userId_key" ON "couple_profiles"("userId");

-- CreateIndex
CREATE INDEX "couple_expenses_coupleProfileId_idx" ON "couple_expenses"("coupleProfileId");

-- CreateIndex
CREATE INDEX "couple_expenses_categoryId_idx" ON "couple_expenses"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "TaskSection_coupleProfileId_title_key" ON "TaskSection"("coupleProfileId", "title");

-- CreateIndex
CREATE UNIQUE INDEX "CoupleTimelineSection_coupleProfileId_category_key" ON "CoupleTimelineSection"("coupleProfileId", "category");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_profiles_userId_key" ON "vendor_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_profiles_currentSubscriptionId_key" ON "vendor_profiles"("currentSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_availabilities_vendorId_blockedDate_key" ON "vendor_availabilities"("vendorId", "blockedDate");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_subscriptions_stripeSubscriptionId_key" ON "vendor_subscriptions"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_stripeIntentId_key" ON "payments"("stripeIntentId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OtpToken" ADD CONSTRAINT "OtpToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "couple_profiles" ADD CONSTRAINT "couple_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "couple_profiles" ADD CONSTRAINT "couple_profiles_weldingStyleId_fkey" FOREIGN KEY ("weldingStyleId") REFERENCES "WeddingStyle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "couple_expenses" ADD CONSTRAINT "couple_expenses_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "couple_expenses" ADD CONSTRAINT "couple_expenses_coupleProfileId_fkey" FOREIGN KEY ("coupleProfileId") REFERENCES "couple_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskSection" ADD CONSTRAINT "TaskSection_coupleProfileId_fkey" FOREIGN KEY ("coupleProfileId") REFERENCES "couple_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "couple_tasks" ADD CONSTRAINT "couple_tasks_taskSectionId_fkey" FOREIGN KEY ("taskSectionId") REFERENCES "TaskSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoupleTimelineSection" ADD CONSTRAINT "CoupleTimelineSection_coupleProfileId_fkey" FOREIGN KEY ("coupleProfileId") REFERENCES "couple_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "couple_timeline_tasks" ADD CONSTRAINT "couple_timeline_tasks_coupleTimelineSectionId_fkey" FOREIGN KEY ("coupleTimelineSectionId") REFERENCES "CoupleTimelineSection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wedding_day_schedules" ADD CONSTRAINT "wedding_day_schedules_coupleProfileId_fkey" FOREIGN KEY ("coupleProfileId") REFERENCES "couple_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_vendors" ADD CONSTRAINT "saved_vendors_coupleProfileId_fkey" FOREIGN KEY ("coupleProfileId") REFERENCES "couple_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_vendors" ADD CONSTRAINT "saved_vendors_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendor_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_profiles" ADD CONSTRAINT "vendor_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_profiles" ADD CONSTRAINT "vendor_profiles_currentSubscriptionId_fkey" FOREIGN KEY ("currentSubscriptionId") REFERENCES "vendor_subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_profiles" ADD CONSTRAINT "vendor_profiles_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_portfolios" ADD CONSTRAINT "vendor_portfolios_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_availabilities" ADD CONSTRAINT "vendor_availabilities_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "couple_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_subscriptions" ADD CONSTRAINT "vendor_subscriptions_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_subscriptions" ADD CONSTRAINT "vendor_subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "vendor_subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_packages" ADD CONSTRAINT "vendor_packages_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_bookings" ADD CONSTRAINT "vendor_bookings_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_bookings" ADD CONSTRAINT "vendor_bookings_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "vendor_packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
