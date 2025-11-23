import { Injectable } from "@nestjs/common";
import { Prisma } from "prisma/generated/client";
import {
  PaginationParams,
  PaginationResponseParams,
} from "src/core/repositories/pagination-params";
import {
  CableConnectorsRepository,
  FetchCableConnectorsFilterOptions,
} from "src/domain/eletrical-distribution-budgeting/application/repositories/cable-connectors-repository";
import { CableConnector } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/cable-connector";
import { PrismaCableConnectorMapper } from "../../mappers/eletrical-distribution-budgeting/prisma-cable-connector-mapper";
import { PrismaService } from "../../prisma.service";

@Injectable()
export class PrismaCableConnectorsRepository
  implements CableConnectorsRepository
{
  constructor(private prisma: PrismaService) {}

  async createMany(cableConnectors: CableConnector[]): Promise<void> {
    await this.prisma.cableConnector.createMany({
      data: cableConnectors.map(PrismaCableConnectorMapper.toPrisma),
    });
  }

  async save(cableConnector: CableConnector): Promise<void> {
    const data = PrismaCableConnectorMapper.toPrisma(cableConnector);
    await this.prisma.cableConnector.update({
      where: { id: data.id },
      data,
    });
  }

  async findById(id: string): Promise<CableConnector | null> {
    const cableConnector = await this.prisma.cableConnector.findUnique({
      where: { id },
    });

    if (!cableConnector) {
      return null;
    }

    return PrismaCableConnectorMapper.toDomain(cableConnector);
  }

  async findByIds(ids: string[]): Promise<CableConnector[]> {
    const cableConnectors = await this.prisma.cableConnector.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return cableConnectors.map(PrismaCableConnectorMapper.toDomain);
  }

  async findByCode(code: number): Promise<CableConnector | null> {
    const cableConnector = await this.prisma.cableConnector.findFirst({
      where: { code },
    });

    if (!cableConnector) {
      return null;
    }

    return PrismaCableConnectorMapper.toDomain(cableConnector);
  }

  async findAllCodes(): Promise<number[]> {
    const cableConnectors = await this.prisma.cableConnector.findMany({
      select: { code: true },
    });

    return cableConnectors.map((c) => c.code);
  }

  async getAllOrderedByLength(): Promise<CableConnector[]> {
    const cableConnectors = await this.prisma.cableConnector.findMany({
      orderBy: {
        entranceMinValueMM: "asc",
      },
    });

    return cableConnectors.map(PrismaCableConnectorMapper.toDomain);
  }

  async fetchWithFilter(
    filterOptions: FetchCableConnectorsFilterOptions,
    paginationParams: PaginationParams,
  ): Promise<{
    cableConnectors: CableConnector[];
    pagination: PaginationResponseParams;
  }> {
    const where: Prisma.CableConnectorWhereInput = {};

    if (filterOptions.codes) {
      where.code = { in: filterOptions.codes };
    }
    if (filterOptions.description) {
      where.description = {
        contains: filterOptions.description,
        mode: "insensitive",
      };
    }

    const [count, cableConnectors] = await Promise.all([
      this.prisma.cableConnector.count({ where }),
      this.prisma.cableConnector.findMany({
        where,
        take: paginationParams.pageSize,
        skip: (paginationParams.page - 1) * paginationParams.pageSize,
      }),
    ]);

    return {
      cableConnectors: cableConnectors.map(PrismaCableConnectorMapper.toDomain),
      pagination: {
        actualPage: paginationParams.page,
        actualPageSize: cableConnectors.length,
        lastPage: Math.ceil(count / paginationParams.pageSize),
      },
    };
  }
}
