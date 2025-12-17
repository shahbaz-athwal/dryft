/*
  Warnings:

  - A unique constraint covering the columns `[rmpId]` on the table `rating` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `attendanceRequired` to the `rating` table without a default value. This is not possible if the table is not empty.
  - Added the required column `courseId` to the `rating` table without a default value. This is not possible if the table is not empty.
  - Added the required column `difficulty` to the `rating` table without a default value. This is not possible if the table is not empty.
  - Added the required column `postedAt` to the `rating` table without a default value. This is not possible if the table is not empty.
  - Added the required column `professorId` to the `rating` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quality` to the `rating` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING_ANALYSIS', 'APPROVED', 'AI_FLAGGED', 'USER_FLAGGED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "professor" ADD COLUMN     "designation" TEXT NOT NULL DEFAULT 'Professor',
ADD COLUMN     "email" TEXT,
ADD COLUMN     "linkedinUrl" TEXT,
ADD COLUMN     "officeLocation" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "websiteUrl" TEXT;

-- AlterTable
ALTER TABLE "rating" ADD COLUMN     "attendanceRequired" BOOLEAN NOT NULL,
ADD COLUMN     "comment" TEXT,
ADD COLUMN     "courseId" TEXT NOT NULL,
ADD COLUMN     "difficulty" INTEGER NOT NULL,
ADD COLUMN     "gradeReceived" TEXT,
ADD COLUMN     "isForCredit" BOOLEAN,
ADD COLUMN     "postedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "professorId" TEXT NOT NULL,
ADD COLUMN     "quality" INTEGER NOT NULL,
ADD COLUMN     "rmpId" TEXT,
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'PENDING_ANALYSIS',
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "textBookRequired" BOOLEAN,
ADD COLUMN     "thumbsDownTotal" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "thumbsUpTotal" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "userId" TEXT,
ADD COLUMN     "wouldTakeAgain" BOOLEAN;

-- CreateTable
CREATE TABLE "flag" (
    "id" TEXT NOT NULL,
    "ratingId" TEXT,
    "fileId" TEXT,
    "reason" TEXT NOT NULL,
    "reviewStatus" "ReviewStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "flag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "courseId" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'PENDING_ANALYSIS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "file_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "flag_ratingId_idx" ON "flag"("ratingId");

-- CreateIndex
CREATE INDEX "flag_fileId_idx" ON "flag"("fileId");

-- CreateIndex
CREATE INDEX "flag_reviewStatus_idx" ON "flag"("reviewStatus");

-- CreateIndex
CREATE UNIQUE INDEX "file_key_key" ON "file"("key");

-- CreateIndex
CREATE INDEX "file_courseId_idx" ON "file"("courseId");

-- CreateIndex
CREATE INDEX "file_status_idx" ON "file"("status");

-- CreateIndex
CREATE UNIQUE INDEX "rating_rmpId_key" ON "rating"("rmpId");

-- CreateIndex
CREATE INDEX "rating_professorId_idx" ON "rating"("professorId");

-- CreateIndex
CREATE INDEX "rating_courseId_idx" ON "rating"("courseId");

-- CreateIndex
CREATE INDEX "rating_status_idx" ON "rating"("status");

-- AddForeignKey
ALTER TABLE "flag" ADD CONSTRAINT "flag_ratingId_fkey" FOREIGN KEY ("ratingId") REFERENCES "rating"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flag" ADD CONSTRAINT "flag_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "file"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flag" ADD CONSTRAINT "flag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rating" ADD CONSTRAINT "rating_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "professor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rating" ADD CONSTRAINT "rating_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rating" ADD CONSTRAINT "rating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file" ADD CONSTRAINT "file_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file" ADD CONSTRAINT "file_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
