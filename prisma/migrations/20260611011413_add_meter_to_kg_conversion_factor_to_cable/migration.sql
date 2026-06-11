-- AlterEnum
ALTER TYPE "TensionLevel" ADD VALUE 'ANY';

-- AlterTable
ALTER TABLE "cables" ADD COLUMN     "meter_to_kg_conversion_factor" DOUBLE PRECISION;
