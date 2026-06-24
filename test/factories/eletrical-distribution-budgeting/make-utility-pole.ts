import { faker } from "@faker-js/faker";
import { Injectable } from "@nestjs/common";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import {
  UtilityPole,
  UtilityPoleProps,
} from "src/domain/eletrical-distribution-budgeting/enterprise/entities/utility-pole";
import { PrismaUtilityPoleMapper } from "src/infra/database/prisma/mappers/eletrical-distribution-budgeting/prisma-utility-pole-mapper";
import { PrismaService } from "src/infra/database/prisma/prisma.service";

export function makeUtilityPole(
  override: Partial<UtilityPoleProps> = {},
  id?: UniqueEntityID,
) {
  const utilityPole = UtilityPole.create(
    {
      code: faker.number.int({ min: 1000, max: 9999 }),
      description: faker.lorem.sentence(),
      unit: faker.helpers.arrayElement(["UND", "M", "KG"]),
      strongSideSectionMultiplier: faker.number.float({
        min: 1.0,
        max: 2.0,
      }),
      lowVoltageLevelsCount: faker.number.int({
        min: 1,
        max: 5,
      }),
      mediumVoltageLevelsCount: faker.number.int({
        min: 1,
        max: 5,
      }),
      lowVoltageStartSectionLengthInMM: faker.number.int({
        min: 1000,
        max: 5000,
      }),
      mediumVoltageStartSectionLengthInMM: faker.number.int({
        min: 1000,
        max: 5000,
      }),
      lowVoltageSectionLengthAddBylevelInMM: faker.number.int({
        min: 1000,
        max: 5000,
      }),
      mediumVoltageSectionLengthAddBylevelInMM: faker.number.int({
        min: 1000,
        max: 5000,
      }),
      ...override,
    },
    id,
  );

  return utilityPole;
}

@Injectable()
export class UtilityPoleFactory {
  constructor(private readonly prisma: PrismaService) {}

  async makePrismaUtilityPole(
    data: Partial<UtilityPoleProps> = {},
  ): Promise<UtilityPole> {
    const utilityPole = makeUtilityPole(data);
    await this.prisma.utilityPole.create({
      data: PrismaUtilityPoleMapper.toPrisma(utilityPole),
    });
    return utilityPole;
  }
}
