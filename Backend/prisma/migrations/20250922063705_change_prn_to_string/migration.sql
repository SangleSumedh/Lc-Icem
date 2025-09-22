/*
  Warnings:

  - The primary key for the `Student` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "public"."ApprovalRequest" DROP CONSTRAINT "ApprovalRequest_studentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."StudentProfile" DROP CONSTRAINT "StudentProfile_studentID_fkey";

-- AlterTable
ALTER TABLE "public"."ApprovalRequest" ALTER COLUMN "studentId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."Student" DROP CONSTRAINT "Student_pkey",
ALTER COLUMN "prn" SET DATA TYPE TEXT,
ADD CONSTRAINT "Student_pkey" PRIMARY KEY ("prn");

-- AlterTable
ALTER TABLE "public"."StudentProfile" ALTER COLUMN "prn" SET DATA TYPE TEXT,
ALTER COLUMN "studentID" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "public"."StudentProfile" ADD CONSTRAINT "StudentProfile_studentID_fkey" FOREIGN KEY ("studentID") REFERENCES "public"."Student"("prn") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ApprovalRequest" ADD CONSTRAINT "ApprovalRequest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("prn") ON DELETE RESTRICT ON UPDATE CASCADE;
