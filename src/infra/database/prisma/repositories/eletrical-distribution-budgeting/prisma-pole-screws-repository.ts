import { Injectable } from "@nestjs/common";
import { Prisma } from "prisma/generated/client";
import {
  PaginationParams,
  PaginationResponseParams,
} from "src/core/repositories/pagination-params";
import {
  FetchPoleScrewsFilterOptions,
  PoleScrewsRepository,
} from "src/domain/eletrical-distribution-budgeting/application/repositories/pole-screws-repository";
import { PoleScrew } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/pole-screw";
import { PrismaPoleScrewMapper } from "../../mappers/eletrical-distribution-budgeting/prisma-pole-screw-mapper";
import { PrismaService } from "../../prisma.service";

@Injectable()
export class PrismaPoleScrewsRepository implements PoleScrewsRepository {
  constructor(private prisma: PrismaService) {}

  async createMany(poleScrews: PoleScrew[]): Promise<void> {
    await this.prisma.poleScrew.createMany({
      data: poleScrews.map(PrismaPoleScrewMapper.toPrisma),
    });
  }

  async save(poleScrew: PoleScrew): Promise<void> {
    const data = PrismaPoleScrewMapper.toPrisma(poleScrew);
    await this.prisma.poleScrew.update({
      where: { id: data.id },
      data,
    });
  }

  async findById(id: string): Promise<PoleScrew | null> {
    const poleScrew = await this.prisma.poleScrew.findUnique({
      where: { id },
    });

    if (!poleScrew) {
      return null;
    }

    return PrismaPoleScrewMapper.toDomain(poleScrew);
  }

  async findByIds(ids: string[]): Promise<PoleScrew[]> {
    const poleScrews = await this.prisma.poleScrew.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return poleScrews.map(PrismaPoleScrewMapper.toDomain);
  }

  async findByCode(code: number): Promise<PoleScrew | null> {
    const poleScrew = await this.prisma.poleScrew.findFirst({
      where: { code },
    });

    if (!poleScrew) {
      return null;
    }

    return PrismaPoleScrewMapper.toDomain(poleScrew);
  }

  async findAllCodes(): Promise<number[]> {
    const poleScrews = await this.prisma.poleScrew.findMany({
      select: { code: true },
    });

    return poleScrews.map((p) => p.code);
  }

  async getAllOrderedByLength(): Promise<PoleScrew[]> {
    const poleScrews = await this.prisma.poleScrew.findMany({
      orderBy: {
        lengthInMM: "asc",
      },
    });

    return poleScrews.map(PrismaPoleScrewMapper.toDomain);
  }

  async fetchWithFilter(
    filterOptions: FetchPoleScrewsFilterOptions,
    paginationParams: PaginationParams,
  ): Promise<{
    poleScrews: PoleScrew[];
    pagination: PaginationResponseParams;
  }> {
    const where: Prisma.PoleScrewWhereInput = {};

    if (filterOptions.codes) {
      where.code = { in: filterOptions.codes };
    }
    if (filterOptions.description) {
      where.description = {
        contains: filterOptions.description,
        mode: "insensitive",
      };
    }

    const [count, poleScrews] = await Promise.all([
      this.prisma.poleScrew.count({ where }),
      this.prisma.poleScrew.findMany({
        where,
        take: paginationParams.pageSize,
        skip: (paginationParams.page - 1) * paginationParams.pageSize,
      }),
    ]);

    return {
      poleScrews: poleScrews.map(PrismaPoleScrewMapper.toDomain),
      pagination: {
        actualPage: paginationParams.page,
        actualPageSize: poleScrews.length,
        lastPage: Math.ceil(count / paginationParams.pageSize),
      },
    };
  }
}
