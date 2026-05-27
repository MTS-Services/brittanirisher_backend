-- CreateTable
CREATE TABLE "saved_vendors" (
    "id" TEXT NOT NULL,
    "coupleProfileId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_vendors_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "saved_vendors" ADD CONSTRAINT "saved_vendors_coupleProfileId_fkey" FOREIGN KEY ("coupleProfileId") REFERENCES "couple_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_vendors" ADD CONSTRAINT "saved_vendors_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendor_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
