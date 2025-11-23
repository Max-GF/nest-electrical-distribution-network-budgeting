import { Injectable } from "@nestjs/common";
import { Prisma } from "prisma/generated/client";
import {
  PaginationParams,
  PaginationResponseParams,
} from "src/core/repositories/pagination-params";
import {
  CablesRepository,
  FetchCablesFilterOptions,
} from "src/domain/eletrical-distribution-budgeting/application/repositories/cables-repository";
import { Cable } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/cable";
import { PrismaCableMapper } from "../../mappers/eletrical-distribution-budgeting/prisma-cable-mapper";
import { PrismaService } from "../../prisma.service";

@Injectable()
export class PrismaCablesRepository implements CablesRepository {
  constructor(private prisma: PrismaService) {}

  async createMany(cables: Cable[]): Promise<void> {
    await this.prisma.cable.createMany({
      data: cables.map(PrismaCableMapper.toPrisma),
    });
  }

  async save(cable: Cable): Promise<void> {
    const data = PrismaCableMapper.toPrisma(cable);
    await this.prisma.cable.update({
      where: { id: data.id },
      data,
    });
  }

  async findById(id: string): Promise<Cable | null> {
    const cable = await this.prisma.cable.findUnique({
      where: { id },
    });

    if (!cable) {
      return null;
    }

    return PrismaCableMapper.toDomain(cable);
  }

  async findByIds(ids: string[]): Promise<Cable[]> {
    const cables = await this.prisma.cable.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return cables.map(PrismaCableMapper.toDomain);
  }

  async findByCode(code: number): Promise<Cable | null> {
    const cable = await this.prisma.cable.findFirst({
      where: { code },
    });

    if (!cable) {
      return null;
    }

    return PrismaCableMapper.toDomain(cable);
  }

  async findAllCodes(): Promise<number[]> {
    const cables = await this.prisma.cable.findMany({
      select: { code: true },
    });

    return cables.map((c) => c.code);
  }

  async fetchWithFilter(
    filterOptions: FetchCablesFilterOptions,
    paginationParams: PaginationParams,
  ): Promise<{
    cables: Cable[];
    pagination: PaginationResponseParams;
  }> {
    const where: Prisma.CableWhereInput = {};

    if (filterOptions.codes) {
      where.code = { in: filterOptions.codes };
    }
    if (filterOptions.description) {
      where.description = {
        contains: filterOptions.description,
        mode: "insensitive",
      };
    }
    if (filterOptions.tension) {
      where.tension = filterOptions.tension;
    }

    const [count, cables] = await Promise.all([
      this.prisma.cable.count({ where }),
      this.prisma.cable.findMany({
        where,
        take: paginationParams.pageSize,
        skip: (paginationParams.page - 1) * paginationParams.pageSize,
      }),
    ]);

    return {
      cables: cables.map(PrismaCableMapper.toDomain),
      pagination: {
        actualPage: paginationParams.page,
        actualPageSize: cables.length,
        lastPage: Math.ceil(count / paginationParams.pageSize),
      },
    };
  }
}
