/*
  Warnings:

  - Made the column `description` on table `course` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "course" ADD COLUMN     "matchingSectionIds" TEXT[],
ALTER COLUMN "description" SET NOT NULL;
