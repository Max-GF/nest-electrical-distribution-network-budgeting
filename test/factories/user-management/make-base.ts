import { faker } from "@faker-js/faker";
import { Injectable } from "@nestjs/common";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import {
  Base,
  BaseProps,
} from "src/domain/user-management/enterprise/entities/base";
import { PrismaBaseMapper } from "src/infra/database/prisma/mappers/user-management/prisma-base-mapper";
import { PrismaService } from "src/infra/database/prisma/prisma.service";

export function makeBase(
  override: Partial<BaseProps> = {},
  id?: UniqueEntityID,
) {
  const base = Base.create(
    {
      name: faker.company.name(),
      companyId: new UniqueEntityID(),
      ...override,
    },
    id,
  );

  return base;
}

@Injectable()
export class BaseFactory {
  constructor(private readonly prisma: PrismaService) {}

  async makePrismaBase(data: Partial<BaseProps> = {}): Promise<Base> {
    const base = makeBase(data);
    await this.prisma.base.create({
      data: PrismaBaseMapper.toPrisma(base),
    });
    return base;
  }
  async makePrismaManyRandomBases(
    data: Partial<BaseProps> = {},
    howMany = 1,
  ): Promise<Base[]> {
    const bases = Array.from({ length: howMany }, () => makeBase(data));
    await this.prisma.base.createMany({
      data: bases.map(PrismaBaseMapper.toPrisma),
    });

    return bases;
  }
}
