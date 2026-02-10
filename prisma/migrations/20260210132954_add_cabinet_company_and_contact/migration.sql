-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "cabinetCompanyId" TEXT,
ADD COLUMN     "cabinetContactId" TEXT;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_cabinetCompanyId_fkey" FOREIGN KEY ("cabinetCompanyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_cabinetContactId_fkey" FOREIGN KEY ("cabinetContactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;
