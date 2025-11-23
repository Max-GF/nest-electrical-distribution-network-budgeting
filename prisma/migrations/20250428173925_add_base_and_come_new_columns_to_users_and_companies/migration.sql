/*
  Warnings:

  - You are about to drop the column `created_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cnpj]` on the table `companies` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cpf]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cnpj` to the `companies` table without a default value. This is not possible if the table is not empty.
  - Added the required column `base_id` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cpf` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'COMMON');

-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "cnpj" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "created_at",
DROP COLUMN "updated_at",
ADD COLUMN     "base_id" TEXT NOT NULL,
ADD COLUMN     "cpf" TEXT NOT NULL,
ADD COLUMN     "first_login" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'COMMON';

-- CreateTable
CREATE TABLE "bases" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,

    CONSTRAINT "bases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "companies_cnpj_key" ON "companies"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "users_cpf_key" ON "users"("cpf");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_base_id_fkey" FOREIGN KEY ("base_id") REFERENCES "bases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bases" ADD CONSTRAINT "bases_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
