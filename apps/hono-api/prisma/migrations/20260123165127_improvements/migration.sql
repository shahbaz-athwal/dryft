/*
  Warnings:

  - The primary key for the `section` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "professor" ALTER COLUMN "designation" DROP NOT NULL,
ALTER COLUMN "designation" DROP DEFAULT;

-- AlterTable
ALTER TABLE "section" DROP CONSTRAINT "section_pkey",
ADD CONSTRAINT "section_pkey" PRIMARY KEY ("id", "termCode");

-- CreateIndex
CREATE INDEX "course_title_idx" ON "course"("title");
