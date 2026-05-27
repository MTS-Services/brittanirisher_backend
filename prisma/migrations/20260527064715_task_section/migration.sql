-- AlterTable
ALTER TABLE "couple_tasks" ADD COLUMN     "taskSectionId" TEXT;

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

-- CreateIndex
CREATE UNIQUE INDEX "TaskSection_coupleProfileId_title_key" ON "TaskSection"("coupleProfileId", "title");

-- AddForeignKey
ALTER TABLE "TaskSection" ADD CONSTRAINT "TaskSection_coupleProfileId_fkey" FOREIGN KEY ("coupleProfileId") REFERENCES "couple_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "couple_tasks" ADD CONSTRAINT "couple_tasks_taskSectionId_fkey" FOREIGN KEY ("taskSectionId") REFERENCES "TaskSection"("id") ON DELETE SET NULL ON UPDATE CASCADE;
