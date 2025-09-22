-- CreateTable
CREATE TABLE "public"."SuperAdmin" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SuperAdmin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SuperAdmin_username_key" ON "public"."SuperAdmin"("username");

-- CreateIndex
CREATE UNIQUE INDEX "SuperAdmin_email_key" ON "public"."SuperAdmin"("email");
