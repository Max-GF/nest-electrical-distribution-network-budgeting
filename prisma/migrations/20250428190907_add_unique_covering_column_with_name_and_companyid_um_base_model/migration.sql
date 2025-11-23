/*
  Warnings:

  - A unique constraint covering the columns `[name,company_id]` on the table `bases` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "bases_name_company_id_key" ON "bases"("name", "company_id");
