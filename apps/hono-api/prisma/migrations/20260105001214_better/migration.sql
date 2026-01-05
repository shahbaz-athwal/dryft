/*
  Warnings:

  - You are about to drop the column `key` on the `file` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `file` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `flag` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `rating` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[originalKey]` on the table `file` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `originalKey` to the `file` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "file" DROP CONSTRAINT "file_userId_fkey";

-- DropForeignKey
ALTER TABLE "flag" DROP CONSTRAINT "flag_userId_fkey";

-- DropForeignKey
ALTER TABLE "rating" DROP CONSTRAINT "rating_userId_fkey";

-- DropIndex
DROP INDEX "file_key_key";

-- AlterTable
ALTER TABLE "department" ADD COLUMN     "facultyUrl" TEXT,
ADD COLUMN     "websiteUrl" TEXT;

-- AlterTable
ALTER TABLE "file" DROP COLUMN "key",
DROP COLUMN "userId",
ADD COLUMN     "originalKey" TEXT NOT NULL,
ADD COLUMN     "processedKey" TEXT,
ADD COLUMN     "resourceType" TEXT,
ALTER COLUMN "status" SET DEFAULT 'PROCESSING';

-- AlterTable
ALTER TABLE "flag" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "rating" DROP COLUMN "userId",
ALTER COLUMN "status" SET DEFAULT 'PROCESSING';

-- CreateIndex
CREATE UNIQUE INDEX "file_originalKey_key" ON "file"("originalKey");
