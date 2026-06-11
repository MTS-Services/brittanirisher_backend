-- AlterTable
ALTER TABLE "vendor_profiles" ADD COLUMN     "contactLinks" JSONB,
ADD COLUMN     "socialLinks" JSONB;

-- CreateTable
CREATE TABLE "vendor_reviews" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT true,
    "images" TEXT[],
    "vendorId" TEXT NOT NULL,
    "coupleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_profile_views" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "viewerId" TEXT,
    "viewerIp" TEXT NOT NULL,
    "userAgent" TEXT,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_profile_views_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "vendor_reviews" ADD CONSTRAINT "vendor_reviews_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_reviews" ADD CONSTRAINT "vendor_reviews_coupleId_fkey" FOREIGN KEY ("coupleId") REFERENCES "couple_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_profile_views" ADD CONSTRAINT "vendor_profile_views_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_profile_views" ADD CONSTRAINT "vendor_profile_views_viewerId_fkey" FOREIGN KEY ("viewerId") REFERENCES "couple_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
