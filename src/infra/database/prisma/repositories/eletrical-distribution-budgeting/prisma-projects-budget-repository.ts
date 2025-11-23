import { Injectable } from "@nestjs/common";
import { ProjectsBudgetRepository } from "src/domain/eletrical-distribution-budgeting/application/repositories/projects-budget-repository";
import { Point } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/point";
import { Project } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/project";
import { ProjectMaterial } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/project-material";
import { PrismaPointMapper } from "../../mappers/eletrical-distribution-budgeting/prisma-point-mapper";
import { PrismaProjectMapper } from "../../mappers/eletrical-distribution-budgeting/prisma-project-mapper";
import { PrismaProjectMaterialMapper } from "../../mappers/eletrical-distribution-budgeting/prisma-project-material-mapper";
import { PrismaService } from "../../prisma.service";

@Injectable()
export class PrismaProjectsBudgetRepository
  implements ProjectsBudgetRepository
{
  constructor(private prisma: PrismaService) {}

  async saveProjectBudgetMaterials(
    project: Project,
    pointsToSave: Point[],
    projectMaterials: ProjectMaterial[],
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Update project
      const projectData = PrismaProjectMapper.toPrisma(project);
      await tx.project.update({
        where: { id: projectData.id },
        data: projectData,
      });

      // Update points
      for (const point of pointsToSave) {
        const pointData = PrismaPointMapper.toPrisma(point);
        await tx.point.update({
          where: { id: pointData.id },
          data: pointData,
        });
      }

      // Delete existing project materials
      await tx.projectMaterial.deleteMany({
        where: { projectId: project.id.toString() },
      });

      // Create new project materials
      if (projectMaterials.length > 0) {
        await tx.projectMaterial.createMany({
          data: projectMaterials.map(PrismaProjectMaterialMapper.toPrisma),
        });
      }
    });
  }
}
