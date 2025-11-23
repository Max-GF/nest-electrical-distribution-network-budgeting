-- CreateEnum
CREATE TYPE "TensionLevel" AS ENUM ('LOW', 'MEDIUM');

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

    CONSTRAINT "cables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cable_connectors" (
    "id" TEXT NOT NULL,
    "code" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "entrance_min_value_mm" DOUBLE PRECISION NOT NULL,
    "entrance_max_value_mm" DOUBLE PRECISION NOT NULL,
    "exit_min_value_mm" DOUBLE PRECISION NOT NULL,
    "exit_max_value_mm" DOUBLE PRECISION NOT NULL,

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
    "local_cable_section_in_mm" DOUBLE PRECISION,
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

-- AddForeignKey
ALTER TABLE "group_items" ADD CONSTRAINT "group_items_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_items" ADD CONSTRAINT "group_items_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materials"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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
