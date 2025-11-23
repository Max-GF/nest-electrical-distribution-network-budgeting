import { faker } from "@faker-js/faker";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import {
  Group,
  GroupProps,
} from "src/domain/eletrical-distribution-budgeting/enterprise/entities/group";
import { TensionLevel } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/value-objects/tension-level";

export function makeGroup(
  override: Partial<GroupProps> = {},
  id?: UniqueEntityID,
) {
  const group = Group.create(
    {
      name: faker.lorem.word(),
      description: faker.lorem.sentence(),
      tension: TensionLevel.create(
        faker.helpers.arrayElement(["LOW", "MEDIUM"]),
      ),
      ...override,
    },
    id,
  );

  return group;
}
