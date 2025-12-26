/*
  Warnings:

  - The `status` column on the `file` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `rating` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `reviewStatus` on the `flag` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "file" DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING_ANALYSIS';

-- AlterTable
ALTER TABLE "flag" DROP COLUMN "reviewStatus",
ADD COLUMN     "reviewStatus" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "rating" DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING_ANALYSIS';

-- DropEnum
DROP TYPE "ReviewStatus";

-- DropEnum
DROP TYPE "Status";

-- CreateIndex
CREATE INDEX "file_status_idx" ON "file"("status");

-- CreateIndex
CREATE INDEX "flag_reviewStatus_idx" ON "flag"("reviewStatus");

-- CreateIndex
CREATE INDEX "rating_status_idx" ON "rating"("status");
