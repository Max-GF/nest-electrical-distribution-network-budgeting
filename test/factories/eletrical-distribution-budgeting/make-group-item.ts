import { faker } from "@faker-js/faker";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import {
  GroupItem,
  GroupItemProps,
} from "src/domain/eletrical-distribution-budgeting/enterprise/entities/group-item";

export function makeGroupItem(
  override: Partial<GroupItemProps> = {},
  id?: UniqueEntityID,
) {
  override.type =
    override.type ||
    faker.helpers.arrayElement(["material", "poleScrew", "cableConnector"]);
  if (override.type === "material") {
    return GroupItem.createMaterial(
      {
        groupId: new UniqueEntityID(),
        quantity: faker.number.int({ min: 1, max: 100 }),
        addByPhase: faker.number.int({ min: 0, max: 3 }),
        description: faker.lorem.sentence(),
        materialId: new UniqueEntityID(),
        type: "material",
        ...override,
      },
      id,
    );
  }
  if (override.type === "poleScrew") {
    return GroupItem.createPoleScrew(
      {
        groupId: new UniqueEntityID(),
        quantity: faker.number.int({ min: 1, max: 100 }),
        addByPhase: faker.number.int({ min: 0, max: 3 }),
        description: faker.lorem.sentence(),
        lengthAdd: faker.number.int({ min: 1, max: 20 }),
        type: "poleScrew",
        ...override,
      },
      id,
    );
  }
  if (override.type === "cableConnector") {
    return GroupItem.createCableConnector(
      {
        groupId: new UniqueEntityID(),
        quantity: faker.number.int({ min: 1, max: 100 }),
        addByPhase: faker.number.int({ min: 0, max: 3 }),
        description: faker.lorem.sentence(),
        localCableSectionInMM: faker.number.int({ min: 1, max: 50 }),
        type: "cableConnector",
        ...override,
      },
      id,
    );
  }
  throw new Error("Invalid group item type");
}
