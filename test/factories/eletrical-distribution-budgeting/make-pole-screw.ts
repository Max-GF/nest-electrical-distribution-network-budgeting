import { faker } from "@faker-js/faker";
import { Injectable } from "@nestjs/common";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import {
  PoleScrew,
  PoleScrewProps,
} from "src/domain/eletrical-distribution-budgeting/enterprise/entities/pole-screw";
import { PrismaPoleScrewMapper } from "src/infra/database/prisma/mappers/eletrical-distribution-budgeting/prisma-pole-screw-mapper";
import { PrismaService } from "src/infra/database/prisma/prisma.service";

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

@Injectable()
export class PoleScrewFactory {
  constructor(private readonly prisma: PrismaService) {}

  async makePrismaPoleScrew(
    data: Partial<PoleScrewProps> = {},
  ): Promise<PoleScrew> {
    const poleScrew = makePoleScrew(data);
    await this.prisma.poleScrew.create({
      data: PrismaPoleScrewMapper.toPrisma(poleScrew),
    });
    return poleScrew;
  }
}
