import { faker } from "node_modules/@faker-js/faker/dist/index.cjs";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import {
  Point,
  PointProps,
} from "src/domain/eletrical-distribution-budgeting/enterprise/entities/point";

export function makePoint(
  override: Partial<PointProps> = {},
  id?: UniqueEntityID,
) {
  const point = Point.create(
    {
      name: faker.internet.domainName().toUpperCase(),
      projectId: new UniqueEntityID(),
      description: faker.lorem.sentence(),
      lowTensionEntranceCableId: new UniqueEntityID(),
      lowTensionExitCableId: new UniqueEntityID(),
      mediumTensionEntranceCableId: new UniqueEntityID(),
      mediumTensionExitCableId: new UniqueEntityID(),
      utilityPoleId: new UniqueEntityID(),
      ...override,
    },
    id,
  );

  return point;
}
