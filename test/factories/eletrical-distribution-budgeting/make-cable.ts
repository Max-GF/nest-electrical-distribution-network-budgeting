import { faker } from "@faker-js/faker";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import {
  Cable,
  CableProps,
} from "src/domain/eletrical-distribution-budgeting/enterprise/entities/cable";
import { TensionLevel } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/value-objects/tension-level";

export function makeCable(
  override: Partial<CableProps> = {},
  id?: UniqueEntityID,
) {
  const cable = Cable.create(
    {
      code: faker.number.int({ min: 1000, max: 9999 }),
      description: faker.lorem.sentence(),
      unit: faker.helpers.arrayElement(["UND", "M", "KG"]),
      sectionAreaInMM: faker.number.int({ min: 100, max: 1000 }),
      tension: TensionLevel.create(
        faker.helpers.arrayElement(["LOW", "MEDIUM"]),
      ),
      ...override,
    },
    id,
  );

  return cable;
}
