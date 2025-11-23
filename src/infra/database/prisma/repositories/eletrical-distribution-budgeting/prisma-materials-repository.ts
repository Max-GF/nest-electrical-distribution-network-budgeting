import { Injectable } from "@nestjs/common";
import { Prisma } from "prisma/generated/client";
import {
  PaginationParams,
  PaginationResponseParams,
} from "src/core/repositories/pagination-params";
import {
  FetchMaterialsFilterOptions,
  MaterialsRepository,
} from "src/domain/eletrical-distribution-budgeting/application/repositories/materials-repository";
import { Material } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/material";
import { PrismaMaterialMapper } from "../../mappers/eletrical-distribution-budgeting/prisma-material-mapper";
import { PrismaService } from "../../prisma.service";

@Injectable()
export class PrismaMaterialsRepository implements MaterialsRepository {
  constructor(private prisma: PrismaService) {}

  async createMany(materials: Material[]): Promise<void> {
    await this.prisma.material.createMany({
      data: materials.map(PrismaMaterialMapper.toPrisma),
    });
  }

  async save(material: Material): Promise<void> {
    const data = PrismaMaterialMapper.toPrisma(material);
    await this.prisma.material.update({
      where: { id: data.id },
      data,
    });
  }

  async findById(id: string): Promise<Material | null> {
    const material = await this.prisma.material.findUnique({
      where: { id },
    });

    if (!material) {
      return null;
    }

    return PrismaMaterialMapper.toDomain(material);
  }

  async findByIds(ids: string[]): Promise<Material[]> {
    const materials = await this.prisma.material.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return materials.map(PrismaMaterialMapper.toDomain);
  }

  async findByCode(code: number): Promise<Material | null> {
    const material = await this.prisma.material.findFirst({
      where: { code },
    });

    if (!material) {
      return null;
    }

    return PrismaMaterialMapper.toDomain(material);
  }

  async findAllCodes(): Promise<number[]> {
    const materials = await this.prisma.material.findMany({
      select: { code: true },
    });

    return materials.map((m) => m.code);
  }

  async fetchWithFilter(
    filterOptions: FetchMaterialsFilterOptions,
    paginationParams: PaginationParams,
  ): Promise<{
    materials: Material[];
    pagination: PaginationResponseParams;
  }> {
    const where: Prisma.MaterialWhereInput = {};

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

    const [count, materials] = await Promise.all([
      this.prisma.material.count({ where }),
      this.prisma.material.findMany({
        where,
        take: paginationParams.pageSize,
        skip: (paginationParams.page - 1) * paginationParams.pageSize,
      }),
    ]);

    return {
      materials: materials.map(PrismaMaterialMapper.toDomain),
      pagination: {
        actualPage: paginationParams.page,
        actualPageSize: materials.length,
        lastPage: Math.ceil(count / paginationParams.pageSize),
      },
    };
  }
}
