/*
  Warnings:

  - You are about to drop the `Term` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "section" DROP CONSTRAINT "section_termCode_fkey";

-- DropTable
DROP TABLE "Term";

-- CreateTable
CREATE TABLE "term" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "term_pkey" PRIMARY KEY ("code")
);

-- AddForeignKey
ALTER TABLE "section" ADD CONSTRAINT "section_termCode_fkey" FOREIGN KEY ("termCode") REFERENCES "term"("code") ON DELETE CASCADE ON UPDATE CASCADE;
