import { Injectable } from "@nestjs/common";
import { Prisma } from "prisma/generated/client";
import {
  PaginationParams,
  PaginationResponseParams,
} from "src/core/repositories/pagination-params";
import {
  FetchUtilityPolesFilterOptions,
  UtilityPolesRepository,
} from "src/domain/eletrical-distribution-budgeting/application/repositories/utility-poles-repository";
import { UtilityPole } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/utility-pole";
import { PrismaUtilityPoleMapper } from "../../mappers/eletrical-distribution-budgeting/prisma-utility-pole-mapper";
import { PrismaService } from "../../prisma.service";

@Injectable()
export class PrismaUtilityPolesRepository implements UtilityPolesRepository {
  constructor(private prisma: PrismaService) {}

  async createMany(utilityPoles: UtilityPole[]): Promise<void> {
    await this.prisma.utilityPole.createMany({
      data: utilityPoles.map(PrismaUtilityPoleMapper.toPrisma),
    });
  }

  async save(utilityPole: UtilityPole): Promise<void> {
    const data = PrismaUtilityPoleMapper.toPrisma(utilityPole);
    await this.prisma.utilityPole.update({
      where: { id: data.id },
      data,
    });
  }

  async findById(id: string): Promise<UtilityPole | null> {
    const utilityPole = await this.prisma.utilityPole.findUnique({
      where: { id },
    });

    if (!utilityPole) {
      return null;
    }

    return PrismaUtilityPoleMapper.toDomain(utilityPole);
  }

  async findByIds(ids: string[]): Promise<UtilityPole[]> {
    const utilityPoles = await this.prisma.utilityPole.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return utilityPoles.map(PrismaUtilityPoleMapper.toDomain);
  }

  async findByCode(code: number): Promise<UtilityPole | null> {
    const utilityPole = await this.prisma.utilityPole.findFirst({
      where: { code },
    });

    if (!utilityPole) {
      return null;
    }

    return PrismaUtilityPoleMapper.toDomain(utilityPole);
  }

  async findAllCodes(): Promise<number[]> {
    const utilityPoles = await this.prisma.utilityPole.findMany({
      select: { code: true },
    });

    return utilityPoles.map((u) => u.code);
  }

  async fetchWithFilter(
    filterOptions: FetchUtilityPolesFilterOptions,
    paginationParams: PaginationParams,
  ): Promise<{
    utilityPoles: UtilityPole[];
    pagination: PaginationResponseParams;
  }> {
    const where: Prisma.UtilityPoleWhereInput = {};

    if (filterOptions.codes) {
      where.code = { in: filterOptions.codes };
    }
    if (filterOptions.description) {
      where.description = {
        contains: filterOptions.description,
        mode: "insensitive",
      };
    }
    if (filterOptions.minimumCountForLowVoltageLevels) {
      where.lowVoltageLevelsCount = {
        gte: filterOptions.minimumCountForLowVoltageLevels,
      };
    }
    if (filterOptions.minimumCountForMediumVoltageLevels) {
      where.mediumVoltageLevelsCount = {
        gte: filterOptions.minimumCountForMediumVoltageLevels,
      };
    }

    const [count, utilityPoles] = await Promise.all([
      this.prisma.utilityPole.count({ where }),
      this.prisma.utilityPole.findMany({
        where,
        take: paginationParams.pageSize,
        skip: (paginationParams.page - 1) * paginationParams.pageSize,
      }),
    ]);

    return {
      utilityPoles: utilityPoles.map(PrismaUtilityPoleMapper.toDomain),
      pagination: {
        actualPage: paginationParams.page,
        actualPageSize: utilityPoles.length,
        lastPage: Math.ceil(count / paginationParams.pageSize),
      },
    };
  }
}
