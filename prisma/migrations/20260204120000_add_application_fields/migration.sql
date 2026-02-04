-- CreateEnum
CREATE TYPE "PublisherType" AS ENUM ('CABINET', 'ENTREPRISE');

-- AlterTable
ALTER TABLE "Application" ADD COLUMN "announcementLink" TEXT;
ALTER TABLE "Application" ADD COLUMN "productType" TEXT;
ALTER TABLE "Application" ADD COLUMN "salary" TEXT;
ALTER TABLE "Application" ADD COLUMN "benefits" TEXT;
ALTER TABLE "Application" ADD COLUMN "publisherType" "PublisherType";
ALTER TABLE "Application" ADD COLUMN "platform" TEXT;
