import { faker } from "@faker-js/faker";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import {
  CableConnector,
  CableConnectorProps,
} from "src/domain/eletrical-distribution-budgeting/enterprise/entities/cable-connector";

export function makeCableConnector(
  override: Partial<CableConnectorProps> = {},
  id?: UniqueEntityID,
) {
  const cableConnector = CableConnector.create(
    {
      code: faker.number.int({ min: 1000, max: 9999 }),
      description: faker.lorem.sentence(),
      unit: faker.helpers.arrayElement(["UND", "M", "KG"]),
      entranceMinValueMM: faker.number.int({ min: 100, max: 1000 }),
      entranceMaxValueMM: faker.number.int({ min: 100, max: 1000 }),
      exitMinValueMM: faker.number.int({ min: 100, max: 1000 }),
      exitMaxValueMM: faker.number.int({ min: 100, max: 1000 }),
      ...override,
    },
    id,
  );

  return cableConnector;
}
