/*
  Warnings:

  - You are about to drop the column `coupleProfileId` on the `couple_tasks` table. All the data in the column will be lost.
  - Made the column `taskSectionId` on table `couple_tasks` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "couple_tasks" DROP CONSTRAINT "couple_tasks_coupleProfileId_fkey";

-- DropForeignKey
ALTER TABLE "couple_tasks" DROP CONSTRAINT "couple_tasks_taskSectionId_fkey";

-- AlterTable
ALTER TABLE "couple_tasks" DROP COLUMN "coupleProfileId",
ALTER COLUMN "taskSectionId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "couple_tasks" ADD CONSTRAINT "couple_tasks_taskSectionId_fkey" FOREIGN KEY ("taskSectionId") REFERENCES "TaskSection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
