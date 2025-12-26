-- AlterTable
ALTER TABLE "section" ADD COLUMN     "instructorTBD" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isOnline" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "professorId" DROP NOT NULL;
