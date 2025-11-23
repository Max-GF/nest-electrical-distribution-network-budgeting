import { Injectable } from "@nestjs/common";
import { BasesRepository } from "src/domain/user-management/application/repositories/bases-repository";
import { Base } from "src/domain/user-management/enterprise/entities/base";
import { CacheRepository } from "src/infra/cache/cache-repository";
import { PrismaBaseMapper } from "../../mappers/user-management/prisma-base-mapper";
import { PrismaService } from "../../prisma.service";

@Injectable()
export class PrismaBasesRepository implements BasesRepository {
  constructor(
    private readonly prisma: PrismaService,
    private cache: CacheRepository,
  ) {}

  async createMany(bases: Base[]): Promise<void> {
    const data = bases.map(PrismaBaseMapper.toPrisma);
    await this.prisma.base.createMany({ data });
    await Promise.all(
      bases.map(async (base) => {
        await this.cache.delete(`company:id:${base.companyId}:bases`);
      }),
    );
  }
  async save(base: Base): Promise<void> {
    await this.prisma.base.update({
      where: { id: base.id.toString() },
      data: PrismaBaseMapper.toPrisma(base),
    });

    await Promise.all([
      this.cache.delete(`base:id:${base.id}:*`),
      this.cache.delete(`company:id:${base.companyId}:bases`),
    ]);
  }
  async findByName(name: string, companyId: string): Promise<Base | null> {
    const foundedBase = await this.prisma.base.findUnique({
      where: { name_companyId: { name, companyId } },
    });
    if (!foundedBase) return null;
    return PrismaBaseMapper.toDomain(foundedBase);
  }
  async findById(id: string): Promise<Base | null> {
    const cacheHit = await this.cache.get(`base:id:${id}`);
    if (cacheHit)
      return PrismaBaseMapper.toDomain(JSON.parse(cacheHit)) as Base;

    const foundedBase = await this.prisma.base.findUnique({
      where: { id },
    });
    if (!foundedBase) return null;

    await this.cache.set(`base:id:${id}`, JSON.stringify(foundedBase));

    return PrismaBaseMapper.toDomain(foundedBase);
  }

  async fetchByCompanyId(companyId: string): Promise<Base[]> {
    const cacheHit = await this.cache.get(`company:id:${companyId}:bases`);
    if (cacheHit)
      return JSON.parse(cacheHit).map(PrismaBaseMapper.toDomain) as Base[];

    const bases = await this.prisma.base.findMany({
      where: { companyId },
      orderBy: { name: "asc" },
    });

    await this.cache.set(
      `company:id:${companyId}:bases`,
      JSON.stringify(bases),
    );
    return bases.map(PrismaBaseMapper.toDomain);
  }
}
