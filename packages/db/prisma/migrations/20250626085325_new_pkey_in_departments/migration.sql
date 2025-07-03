/*
  Warnings:

  - You are about to drop the column `departmentId` on the `course` table. All the data in the column will be lost.
  - The primary key for the `department` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `department` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `department` table. All the data in the column will be lost.
  - You are about to drop the column `departmentId` on the `professor` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code]` on the table `course` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code,departmentPrefix]` on the table `course` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[prefix]` on the table `department` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[rmpId]` on the table `department` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[rmpId]` on the table `professor` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departmentPrefix` to the `course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prefix` to the `department` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departmentPrefix` to the `professor` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "course" DROP CONSTRAINT "course_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "professor" DROP CONSTRAINT "professor_departmentId_fkey";

-- AlterTable
ALTER TABLE "course" DROP COLUMN "departmentId",
ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "departmentPrefix" TEXT NOT NULL,
ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "department" DROP CONSTRAINT "department_pkey",
DROP COLUMN "id",
DROP COLUMN "name",
ADD COLUMN     "prefix" TEXT NOT NULL,
ADD CONSTRAINT "department_pkey" PRIMARY KEY ("prefix");

-- AlterTable
ALTER TABLE "professor" DROP COLUMN "departmentId",
ADD COLUMN     "departmentPrefix" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "course_code_key" ON "course"("code");

-- CreateIndex
CREATE UNIQUE INDEX "course_code_departmentPrefix_key" ON "course"("code", "departmentPrefix");

-- CreateIndex
CREATE UNIQUE INDEX "department_prefix_key" ON "department"("prefix");

-- CreateIndex
CREATE UNIQUE INDEX "department_rmpId_key" ON "department"("rmpId");

-- CreateIndex
CREATE UNIQUE INDEX "professor_rmpId_key" ON "professor"("rmpId");

-- AddForeignKey
ALTER TABLE "professor" ADD CONSTRAINT "professor_departmentPrefix_fkey" FOREIGN KEY ("departmentPrefix") REFERENCES "department"("prefix") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course" ADD CONSTRAINT "course_departmentPrefix_fkey" FOREIGN KEY ("departmentPrefix") REFERENCES "department"("prefix") ON DELETE CASCADE ON UPDATE CASCADE;
