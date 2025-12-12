/*
  Warnings:

  - You are about to drop the column `createdAt` on the `course` table. All the data in the column will be lost.
  - You are about to drop the column `lastSync` on the `course` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `course` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `course` table. All the data in the column will be lost.
  - You are about to drop the column `lastSync` on the `department` table. All the data in the column will be lost.
  - You are about to drop the column `rmpId` on the `department` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `professor` table. All the data in the column will be lost.
  - You are about to drop the column `lastSync` on the `professor` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `professor` table. All the data in the column will be lost.
  - You are about to drop the column `classTime` on the `section` table. All the data in the column will be lost.
  - You are about to drop the column `code` on the `section` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `section` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `section` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `section` table. All the data in the column will be lost.
  - You are about to drop the column `room` on the `section` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `section` table. All the data in the column will be lost.
  - Added the required column `credits` to the `course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `buildingName` to the `section` table without a default value. This is not possible if the table is not empty.
  - Added the required column `classEndTime` to the `section` table without a default value. This is not possible if the table is not empty.
  - Added the required column `classStartTime` to the `section` table without a default value. This is not possible if the table is not empty.
  - Added the required column `refreshedAt` to the `section` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roomNumber` to the `section` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sectionCode` to the `section` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sectionSearchName` to the `section` table without a default value. This is not possible if the table is not empty.
  - Added the required column `termCode` to the `section` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "department_rmpId_key";

-- AlterTable
ALTER TABLE "course" DROP COLUMN "createdAt",
DROP COLUMN "lastSync",
DROP COLUMN "metadata",
DROP COLUMN "updatedAt",
ADD COLUMN     "credits" INTEGER NOT NULL,
ADD COLUMN     "lastSectionPulledAt" TIMESTAMP(3),
ADD COLUMN     "requisites" JSONB;

-- AlterTable
ALTER TABLE "department" DROP COLUMN "lastSync",
DROP COLUMN "rmpId";

-- AlterTable
ALTER TABLE "professor" DROP COLUMN "createdAt",
DROP COLUMN "lastSync",
DROP COLUMN "updatedAt",
ADD COLUMN     "lastPullFromRmp" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "section" DROP COLUMN "classTime",
DROP COLUMN "code",
DROP COLUMN "createdAt",
DROP COLUMN "description",
DROP COLUMN "endDate",
DROP COLUMN "room",
DROP COLUMN "startDate",
ADD COLUMN     "buildingName" TEXT NOT NULL,
ADD COLUMN     "classEndTime" TEXT NOT NULL,
ADD COLUMN     "classStartTime" TEXT NOT NULL,
ADD COLUMN     "refreshedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "roomNumber" TEXT NOT NULL,
ADD COLUMN     "sectionCode" TEXT NOT NULL,
ADD COLUMN     "sectionSearchName" TEXT NOT NULL,
ADD COLUMN     "termCode" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "log" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Term" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL,

    CONSTRAINT "Term_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "rating" (
    "id" TEXT NOT NULL,

    CONSTRAINT "rating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "section_termCode_idx" ON "section"("termCode");

-- AddForeignKey
ALTER TABLE "section" ADD CONSTRAINT "section_termCode_fkey" FOREIGN KEY ("termCode") REFERENCES "Term"("code") ON DELETE CASCADE ON UPDATE CASCADE;
