import { faker } from "@faker-js/faker";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import {
  PoleScrew,
  PoleScrewProps,
} from "src/domain/eletrical-distribution-budgeting/enterprise/entities/pole-screw";

export function makePoleScrew(
  override: Partial<PoleScrewProps> = {},
  id?: UniqueEntityID,
) {
  const poleScrew = PoleScrew.create(
    {
      code: faker.number.int({ min: 1000, max: 9999 }),
      description: faker.lorem.sentence(),
      lengthInMM: faker.number.int({ min: 1000, max: 10000 }),
      unit: faker.helpers.arrayElement(["UND", "M", "MM", "KG"]),
      ...override,
    },
    id,
  );

  return poleScrew;
}
