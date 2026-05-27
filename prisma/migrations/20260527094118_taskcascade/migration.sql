-- DropForeignKey
ALTER TABLE "couple_tasks" DROP CONSTRAINT "couple_tasks_taskSectionId_fkey";

-- AddForeignKey
ALTER TABLE "couple_tasks" ADD CONSTRAINT "couple_tasks_taskSectionId_fkey" FOREIGN KEY ("taskSectionId") REFERENCES "TaskSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
