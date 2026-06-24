import { faker } from "@faker-js/faker";
import { Injectable } from "@nestjs/common";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import {
  Cable,
  CableProps,
} from "src/domain/eletrical-distribution-budgeting/enterprise/entities/cable";
import { TensionLevel } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/value-objects/tension-level";
import { PrismaCableMapper } from "src/infra/database/prisma/mappers/eletrical-distribution-budgeting/prisma-cable-mapper";
import { PrismaService } from "src/infra/database/prisma/prisma.service";

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

@Injectable()
export class CableFactory {
  constructor(private readonly prisma: PrismaService) {}

  async makePrismaCable(data: Partial<CableProps> = {}): Promise<Cable> {
    const cable = makeCable(data);
    await this.prisma.cable.create({
      data: PrismaCableMapper.toPrisma(cable),
    });
    return cable;
  }
  async makePrismaManyRandomCables(
    data: Partial<CableProps> = {},
    howMany = 1,
  ): Promise<Cable[]> {
    const cables = Array.from({ length: howMany }, () => makeCable(data));
    await this.prisma.cable.createMany({
      data: cables.map(PrismaCableMapper.toPrisma),
    });

    return cables;
  }
}
