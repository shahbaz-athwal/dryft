/*
  Warnings:

  - You are about to drop the column `name` on the `course` table. All the data in the column will be lost.
  - You are about to drop the column `rmpName` on the `course` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `department` table. All the data in the column will be lost.
  - You are about to drop the column `rmpName` on the `department` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `professor` table. All the data in the column will be lost.
  - You are about to drop the column `rmpFirstName` on the `professor` table. All the data in the column will be lost.
  - You are about to drop the column `rmpLastName` on the `professor` table. All the data in the column will be lost.
  - Added the required column `title` to the `course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `department` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `professor` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."course_code_departmentPrefix_key";

-- AlterTable
ALTER TABLE "public"."course" DROP COLUMN "name",
DROP COLUMN "rmpName",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "lastSync" TIMESTAMP(3),
ADD COLUMN     "sectionIds" TEXT[],
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."department" DROP COLUMN "description",
DROP COLUMN "rmpName",
ADD COLUMN     "lastSync" TIMESTAMP(3),
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."professor" DROP COLUMN "description",
DROP COLUMN "rmpFirstName",
DROP COLUMN "rmpLastName",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "lastSync" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "public"."section" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "courseId" TEXT NOT NULL,
    "professorId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "classTime" TEXT NOT NULL,
    "room" TEXT NOT NULL,
    "days" INTEGER[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "section_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "course_code_idx" ON "public"."course"("code");

-- CreateIndex
CREATE INDEX "course_departmentPrefix_idx" ON "public"."course"("departmentPrefix");

-- CreateIndex
CREATE INDEX "department_prefix_idx" ON "public"."department"("prefix");

-- CreateIndex
CREATE INDEX "department_rmpId_idx" ON "public"."department"("rmpId");

-- CreateIndex
CREATE INDEX "professor_name_idx" ON "public"."professor"("name");

-- CreateIndex
CREATE INDEX "professor_departmentPrefix_idx" ON "public"."professor"("departmentPrefix");

-- CreateIndex
CREATE INDEX "professor_rmpId_idx" ON "public"."professor"("rmpId");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "public"."session"("userId");

-- CreateIndex
CREATE INDEX "user_email_idx" ON "public"."user"("email");

-- AddForeignKey
ALTER TABLE "public"."section" ADD CONSTRAINT "section_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."section" ADD CONSTRAINT "section_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "public"."professor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
