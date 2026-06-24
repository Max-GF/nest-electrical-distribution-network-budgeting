-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'COMMON');

-- CreateEnum
CREATE TYPE "TensionLevel" AS ENUM ('LOW', 'MEDIUM', 'ANY');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'COMMON',
    "base_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "first_login" BOOLEAN NOT NULL DEFAULT true,
    "avatar_id" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bases" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,

    CONSTRAINT "bases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "recipient_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avatars" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "avatars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "budget_already_calculated" BOOLEAN NOT NULL,
    "last_budget_calculated_at" TIMESTAMP(3),

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materials" (
    "id" TEXT NOT NULL,
    "code" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "tension" "TensionLevel" NOT NULL,

    CONSTRAINT "materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "utility_poles" (
    "id" TEXT NOT NULL,
    "code" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "strong_side_section_multiplier" DOUBLE PRECISION NOT NULL,
    "medium_voltage_levels_count" INTEGER NOT NULL,
    "medium_voltage_start_section_length_in_mm" DOUBLE PRECISION NOT NULL,
    "medium_voltage_section_length_add_bylevel_in_mm" DOUBLE PRECISION NOT NULL,
    "low_voltage_levels_count" INTEGER NOT NULL,
    "low_voltage_start_section_length_in_mm" DOUBLE PRECISION NOT NULL,
    "low_voltage_section_length_add_bylevel_in_mm" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "utility_poles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cables" (
    "id" TEXT NOT NULL,
    "code" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "tension" "TensionLevel" NOT NULL,
    "section_area_in_mm" DOUBLE PRECISION NOT NULL,
    "meter_to_kg_conversion_factor" DOUBLE PRECISION,

    CONSTRAINT "cables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cable_connectors" (
    "id" TEXT NOT NULL,
    "code" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "unit" TEXT NOT NULL,

    CONSTRAINT "cable_connectors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pole_screws" (
    "id" TEXT NOT NULL,
    "code" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "length_in_mm" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "pole_screws_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tension" "TensionLevel" NOT NULL,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_items" (
    "id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "add_by_phase" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "material_id" TEXT,
    "length_add" DOUBLE PRECISION,
    "local_cable_id" TEXT,
    "one_side_connector" BOOLEAN,

    CONSTRAINT "group_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "points" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "project_id" TEXT NOT NULL,
    "medium_tension_entrance_cable_id" TEXT,
    "medium_tension_exit_cable_id" TEXT,
    "low_tension_entrance_cable_id" TEXT,
    "low_tension_exit_cable_id" TEXT,
    "utility_pole_id" TEXT,

    CONSTRAINT "points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_materials" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "item_type" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "point_id" TEXT,
    "group_id" TEXT,
    "utility_pole_level" INTEGER,
    "tension_level" "TensionLevel",

    CONSTRAINT "project_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ConnectorEntranceCables" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ConnectorEntranceCables_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ConnectorExitCables" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ConnectorExitCables_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_cpf_key" ON "users"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "companies_name_key" ON "companies"("name");

-- CreateIndex
CREATE UNIQUE INDEX "companies_cnpj_key" ON "companies"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "bases_name_company_id_key" ON "bases"("name", "company_id");

-- CreateIndex
CREATE UNIQUE INDEX "avatars_url_key" ON "avatars"("url");

-- CreateIndex
CREATE UNIQUE INDEX "materials_code_key" ON "materials"("code");

-- CreateIndex
CREATE UNIQUE INDEX "utility_poles_code_key" ON "utility_poles"("code");

-- CreateIndex
CREATE UNIQUE INDEX "cables_code_key" ON "cables"("code");

-- CreateIndex
CREATE UNIQUE INDEX "cable_connectors_code_key" ON "cable_connectors"("code");

-- CreateIndex
CREATE UNIQUE INDEX "pole_screws_code_key" ON "pole_screws"("code");

-- CreateIndex
CREATE INDEX "_ConnectorEntranceCables_B_index" ON "_ConnectorEntranceCables"("B");

-- CreateIndex
CREATE INDEX "_ConnectorExitCables_B_index" ON "_ConnectorExitCables"("B");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_base_id_fkey" FOREIGN KEY ("base_id") REFERENCES "bases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_avatar_id_fkey" FOREIGN KEY ("avatar_id") REFERENCES "avatars"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bases" ADD CONSTRAINT "bases_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_items" ADD CONSTRAINT "group_items_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_items" ADD CONSTRAINT "group_items_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materials"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_items" ADD CONSTRAINT "group_items_local_cable_id_fkey" FOREIGN KEY ("local_cable_id") REFERENCES "cables"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "points" ADD CONSTRAINT "points_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "points" ADD CONSTRAINT "points_medium_tension_entrance_cable_id_fkey" FOREIGN KEY ("medium_tension_entrance_cable_id") REFERENCES "cables"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "points" ADD CONSTRAINT "points_medium_tension_exit_cable_id_fkey" FOREIGN KEY ("medium_tension_exit_cable_id") REFERENCES "cables"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "points" ADD CONSTRAINT "points_low_tension_entrance_cable_id_fkey" FOREIGN KEY ("low_tension_entrance_cable_id") REFERENCES "cables"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "points" ADD CONSTRAINT "points_low_tension_exit_cable_id_fkey" FOREIGN KEY ("low_tension_exit_cable_id") REFERENCES "cables"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "points" ADD CONSTRAINT "points_utility_pole_id_fkey" FOREIGN KEY ("utility_pole_id") REFERENCES "utility_poles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_materials" ADD CONSTRAINT "project_materials_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_materials" ADD CONSTRAINT "project_materials_point_id_fkey" FOREIGN KEY ("point_id") REFERENCES "points"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConnectorEntranceCables" ADD CONSTRAINT "_ConnectorEntranceCables_A_fkey" FOREIGN KEY ("A") REFERENCES "cables"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConnectorEntranceCables" ADD CONSTRAINT "_ConnectorEntranceCables_B_fkey" FOREIGN KEY ("B") REFERENCES "cable_connectors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConnectorExitCables" ADD CONSTRAINT "_ConnectorExitCables_A_fkey" FOREIGN KEY ("A") REFERENCES "cables"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConnectorExitCables" ADD CONSTRAINT "_ConnectorExitCables_B_fkey" FOREIGN KEY ("B") REFERENCES "cable_connectors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
