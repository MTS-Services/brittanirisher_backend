-- DropForeignKey
ALTER TABLE "saved_vendors" DROP CONSTRAINT "saved_vendors_vendorId_fkey";

-- AddForeignKey
ALTER TABLE "saved_vendors" ADD CONSTRAINT "saved_vendors_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
