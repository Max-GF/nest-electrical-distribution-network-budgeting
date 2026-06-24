import { faker } from "@faker-js/faker";
import { Injectable } from "@nestjs/common";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import {
  Project,
  ProjectProps,
} from "src/domain/eletrical-distribution-budgeting/enterprise/entities/project";
import { PrismaProjectMapper } from "src/infra/database/prisma/mappers/eletrical-distribution-budgeting/prisma-project-mapper";
import { PrismaService } from "src/infra/database/prisma/prisma.service";

export function makeProject(
  override: Partial<ProjectProps> = {},
  id?: UniqueEntityID,
) {
  const project = Project.create(
    {
      name: faker.lorem.words(3),
      description: faker.lorem.sentence(),
      budgetAlreadyCalculated: faker.datatype.boolean(),
      lastBudgetCalculatedAt: faker.date.past(),
      ...override,
    },
    id,
  );

  return project;
}

@Injectable()
export class ProjectFactory {
  constructor(private readonly prisma: PrismaService) {}

  async makePrismaProject(data: Partial<ProjectProps> = {}): Promise<Project> {
    const project = makeProject(data);
    await this.prisma.project.create({
      data: PrismaProjectMapper.toPrisma(project),
    });
    return project;
  }
}
