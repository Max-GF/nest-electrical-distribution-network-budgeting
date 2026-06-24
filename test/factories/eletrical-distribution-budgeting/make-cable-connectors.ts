import { faker } from "@faker-js/faker";
import { Injectable } from "@nestjs/common";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import {
  CableConnector,
  CableConnectorProps,
} from "src/domain/eletrical-distribution-budgeting/enterprise/entities/cable-connector";
import { PrismaCableConnectorMapper } from "src/infra/database/prisma/mappers/eletrical-distribution-budgeting/prisma-cable-connector-mapper";
import { PrismaService } from "src/infra/database/prisma/prisma.service";

export function makeCableConnector(
  override: Partial<CableConnectorProps> = {},
  id?: UniqueEntityID,
) {
  const cableConnector = CableConnector.create(
    {
      code: faker.number.int({ min: 1000, max: 9999 }),
      description: faker.lorem.sentence(),
      unit: faker.helpers.arrayElement(["UND", "M", "KG"]),
      entranceCablesOptionsIds: [new UniqueEntityID()],
      exitCablesOptionsIds: [new UniqueEntityID()],
      ...override,
    },
    id,
  );

  return cableConnector;
}

@Injectable()
export class CableConnectorFactory {
  constructor(private readonly prisma: PrismaService) {}

  async makePrismaCableConnector(
    data: Partial<CableConnectorProps> = {},
  ): Promise<CableConnector> {
    const cableConnector = makeCableConnector(data);
    await this.prisma.cableConnector.create({
      data: PrismaCableConnectorMapper.toPrismaCreate(cableConnector),
    });
    return cableConnector;
  }
}
