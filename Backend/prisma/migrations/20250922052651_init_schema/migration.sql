-- CreateEnum
CREATE TYPE "public"."AdmissionMode" AS ENUM ('FIRSTYEAR', 'DIRECTSECONDYEAR', 'MBA', 'MCA');

-- CreateEnum
CREATE TYPE "public"."ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'REQUESTED_INFO');

-- CreateEnum
CREATE TYPE "public"."ActionType" AS ENUM ('APPROVED', 'REJECTED', 'REQUESTED_INFO', 'COMMENTED', 'REOPENED');

-- CreateTable
CREATE TABLE "public"."Student" (
    "prn" INTEGER NOT NULL,
    "studentName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNo" VARCHAR(15),
    "password" VARCHAR(255) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("prn")
);

-- CreateTable
CREATE TABLE "public"."StudentProfile" (
    "profileId" SERIAL NOT NULL,
    "prn" INTEGER NOT NULL,
    "studentID" INTEGER NOT NULL,
    "fatherName" TEXT,
    "motherName" TEXT,
    "caste" TEXT,
    "subCaste" TEXT,
    "nationality" TEXT,
    "placeOfBirth" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "dobWords" TEXT,
    "lastCollege" TEXT,
    "yearOfAdmission" TIMESTAMP(3),
    "branch" TEXT,
    "admissionMode" "public"."AdmissionMode" NOT NULL,
    "reasonForLeaving" TEXT,

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("profileId")
);

-- CreateTable
CREATE TABLE "public"."Department" (
    "deptId" SERIAL NOT NULL,
    "deptName" TEXT NOT NULL,
    "deptHead" TEXT,
    "branchId" INTEGER,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("deptId")
);

-- CreateTable
CREATE TABLE "public"."ApprovalRequest" (
    "approvalId" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "deptId" INTEGER NOT NULL,
    "status" "public"."ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "approvedAt" TIMESTAMP(3),
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApprovalRequest_pkey" PRIMARY KEY ("approvalId")
);

-- CreateTable
CREATE TABLE "public"."ApprovalAction" (
    "actionId" SERIAL NOT NULL,
    "approvalId" INTEGER NOT NULL,
    "deptId" INTEGER NOT NULL,
    "action" "public"."ActionType" NOT NULL,
    "remarks" TEXT,
    "actionAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApprovalAction_pkey" PRIMARY KEY ("actionId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Student_email_key" ON "public"."Student"("email");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_prn_key" ON "public"."StudentProfile"("prn");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_studentID_key" ON "public"."StudentProfile"("studentID");

-- CreateIndex
CREATE UNIQUE INDEX "Department_username_key" ON "public"."Department"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Department_email_key" ON "public"."Department"("email");

-- AddForeignKey
ALTER TABLE "public"."StudentProfile" ADD CONSTRAINT "StudentProfile_studentID_fkey" FOREIGN KEY ("studentID") REFERENCES "public"."Student"("prn") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ApprovalRequest" ADD CONSTRAINT "ApprovalRequest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("prn") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ApprovalRequest" ADD CONSTRAINT "ApprovalRequest_deptId_fkey" FOREIGN KEY ("deptId") REFERENCES "public"."Department"("deptId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ApprovalAction" ADD CONSTRAINT "ApprovalAction_approvalId_fkey" FOREIGN KEY ("approvalId") REFERENCES "public"."ApprovalRequest"("approvalId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ApprovalAction" ADD CONSTRAINT "ApprovalAction_deptId_fkey" FOREIGN KEY ("deptId") REFERENCES "public"."Department"("deptId") ON DELETE RESTRICT ON UPDATE CASCADE;
