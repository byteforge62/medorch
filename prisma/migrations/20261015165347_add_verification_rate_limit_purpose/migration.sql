-- DropIndex
DROP INDEX "VerificationEmailRequest_emailHash_createdAt_idx";

-- DropIndex
DROP INDEX "VerificationEmailRequest_ipHash_createdAt_idx";

-- AlterTable
ALTER TABLE "VerificationEmailRequest" ADD COLUMN     "purpose" TEXT NOT NULL DEFAULT 'EMAIL_VERIFICATION';

-- CreateIndex
CREATE INDEX "VerificationEmailRequest_purpose_emailHash_createdAt_idx" ON "VerificationEmailRequest"("purpose", "emailHash", "createdAt");

-- CreateIndex
CREATE INDEX "VerificationEmailRequest_purpose_ipHash_createdAt_idx" ON "VerificationEmailRequest"("purpose", "ipHash", "createdAt");
