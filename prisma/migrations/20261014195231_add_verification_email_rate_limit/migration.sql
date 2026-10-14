-- CreateTable
CREATE TABLE "VerificationEmailRequest" (
    "id" TEXT NOT NULL,
    "emailHash" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationEmailRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VerificationEmailRequest_emailHash_createdAt_idx" ON "VerificationEmailRequest"("emailHash", "createdAt");

-- CreateIndex
CREATE INDEX "VerificationEmailRequest_ipHash_createdAt_idx" ON "VerificationEmailRequest"("ipHash", "createdAt");
