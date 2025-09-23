-- CreateEnum
CREATE TYPE "public"."College" AS ENUM ('ICEM', 'IGSB');

-- AlterTable
ALTER TABLE "public"."Student" ADD COLUMN     "college" "public"."College" NOT NULL DEFAULT 'ICEM';
