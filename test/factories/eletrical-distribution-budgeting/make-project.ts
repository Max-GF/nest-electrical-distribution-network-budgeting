import { faker } from "@faker-js/faker";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import {
  Project,
  ProjectProps,
} from "src/domain/eletrical-distribution-budgeting/enterprise/entities/project";

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
