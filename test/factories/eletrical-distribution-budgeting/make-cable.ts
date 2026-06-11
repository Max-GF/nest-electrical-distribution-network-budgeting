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
  const unit = override.unit ?? faker.helpers.arrayElement(["M", "KG"]);

  const cable = Cable.create(
    {
      code: faker.number.int({ min: 1000, max: 9999 }),
      description: faker.lorem.sentence(),
      unit,
      sectionAreaInMM: faker.number.int({ min: 100, max: 1000 }),
      tension: TensionLevel.create(
        faker.helpers.arrayElement(["LOW", "MEDIUM"]),
      ),
      meterToKgConversionFactor: unit === "KG" ? 0.5 : undefined,
      ...override,
    },
    id,
  );

  return cable;
}
