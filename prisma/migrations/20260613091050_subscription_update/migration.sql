-- AlterTable
ALTER TABLE "subscription_plans" ADD COLUMN     "isAnalyticShow" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isSocialShow" BOOLEAN NOT NULL DEFAULT false;
