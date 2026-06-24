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
    await this.prisma.$transaction(
      cableConnectors.map((connector) =>
        this.prisma.cableConnector.create({
          data: PrismaCableConnectorMapper.toPrismaCreate(connector),
        }),
      ),
    );
  }

  async save(cableConnector: CableConnector): Promise<void> {
    const data = PrismaCableConnectorMapper.toPrismaUpdate(cableConnector);
    await this.prisma.cableConnector.update({
      where: { id: cableConnector.id.toString() },
      data,
    });
  }

  async findById(id: string): Promise<CableConnector | null> {
    const cableConnector = await this.prisma.cableConnector.findUnique({
      where: { id },
      include: {
        entranceCables: true,
        exitCables: true,
      },
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
      include: {
        entranceCables: true,
        exitCables: true,
      },
    });

    return cableConnectors.map(PrismaCableConnectorMapper.toDomain);
  }

  async findByCode(code: number): Promise<CableConnector | null> {
    const cableConnector = await this.prisma.cableConnector.findFirst({
      where: { code },
      include: {
        entranceCables: true,
        exitCables: true,
      },
    });

    if (!cableConnector) {
      return null;
    }

    return PrismaCableConnectorMapper.toDomain(cableConnector);
  }

  async findByCodes(codes: number[]): Promise<CableConnector[]> {
    const cableConnectors = await this.prisma.cableConnector.findMany({
      where: {
        code: {
          in: codes,
        },
      },
      include: {
        entranceCables: true,
        exitCables: true,
      },
    });

    return cableConnectors.map(PrismaCableConnectorMapper.toDomain);
  }
  async getAll(): Promise<CableConnector[]> {
    const cableConnectors = await this.prisma.cableConnector.findMany({
      include: {
        entranceCables: true,
        exitCables: true,
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
    const { codes, description } = filterOptions;
    const where: Prisma.CableConnectorWhereInput = {};

    if (codes && codes.length > 0) {
      where.code = { in: codes };
    }
    if (description) {
      where.description = {
        contains: description,
        mode: "insensitive",
      };
    }

    const [count, cableConnectors] = await Promise.all([
      this.prisma.cableConnector.count({ where }),
      this.prisma.cableConnector.findMany({
        where,
        take: paginationParams.pageSize,
        skip: (paginationParams.page - 1) * paginationParams.pageSize,
        include: {
          entranceCables: true,
          exitCables: true,
        },
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
