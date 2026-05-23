-- AlterTable
ALTER TABLE "enquiries" ADD COLUMN     "profileId" TEXT;

-- AddForeignKey
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "couple_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
