-- CreateEnum
CREATE TYPE "Shift" AS ENUM ('pagi', 'siang');

-- AlterTable
ALTER TABLE "omzet_entries" ADD COLUMN "shift" "Shift" NOT NULL DEFAULT 'pagi';
ALTER TABLE "omzet_entries" ALTER COLUMN "shift" DROP DEFAULT;