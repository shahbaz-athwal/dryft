/*
  Warnings:

  - You are about to drop the column `sectionIds` on the `course` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."course_code_idx";

-- DropIndex
DROP INDEX "public"."department_prefix_idx";

-- DropIndex
DROP INDEX "public"."department_prefix_key";

-- DropIndex
DROP INDEX "public"."department_rmpId_idx";

-- DropIndex
DROP INDEX "public"."professor_rmpId_idx";

-- DropIndex
DROP INDEX "public"."user_email_idx";

-- AlterTable
ALTER TABLE "course" DROP COLUMN "sectionIds",
ADD COLUMN     "metadata" JSONB;

-- CreateIndex
CREATE INDEX "course_professor_courseId_idx" ON "course_professor"("courseId");

-- CreateIndex
CREATE INDEX "course_professor_professorId_idx" ON "course_professor"("professorId");

-- CreateIndex
CREATE INDEX "section_courseId_idx" ON "section"("courseId");

-- CreateIndex
CREATE INDEX "section_professorId_idx" ON "section"("professorId");
