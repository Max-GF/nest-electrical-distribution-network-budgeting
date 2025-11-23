import { Project as PrismaProject } from "prisma/generated/client";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { Project as DomainProject } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/project";

export class PrismaProjectMapper {
  static toDomain(raw: PrismaProject): DomainProject {
    return DomainProject.create(
      {
        name: raw.name,
        description: raw.description,
        budgetAlreadyCalculated: raw.budgetAlreadyCalculated,
        lastBudgetCalculatedAt: raw.lastBudgetCalculatedAt ?? undefined,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(project: DomainProject): PrismaProject {
    return {
      id: project.id.toString(),
      name: project.name,
      description: project.description,
      budgetAlreadyCalculated: project.budgetAlreadyCalculated,
      lastBudgetCalculatedAt: project.lastBudgetCalculatedAt ?? null,
    };
  }
}
