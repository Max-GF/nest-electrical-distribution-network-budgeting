import { Injectable } from "@nestjs/common";
import { CompaniesRepository } from "src/domain/user-management/application/repositories/companies-repository";
import { Company } from "src/domain/user-management/enterprise/entities/company";
import { CompanyWithBases } from "src/domain/user-management/enterprise/entities/value-objects/company-with-bases";
import { CacheRepository } from "src/infra/cache/cache-repository";
import { PrismaCompanyMapper } from "../../mappers/user-management/prisma-company-mapper";
import { PrismaService } from "../../prisma.service";

@Injectable()
export class PrismaCompaniesRepository implements CompaniesRepository {
  constructor(
    private readonly prisma: PrismaService,
    private cache: CacheRepository,
  ) {}

  async createMany(companies: Company[]): Promise<void> {
    const data = companies.map(PrismaCompanyMapper.toPrisma);
    await this.prisma.company.createMany({ data });
  }
  async save(company: Company): Promise<void> {
    await this.prisma.company.update({
      where: { id: company.id.toString() },
      data: PrismaCompanyMapper.toPrisma(company),
    });
    await this.cache.delete(`company:id:${company.id}*`);
  }
  async findById(id: string): Promise<Company | null> {
    const cacheHit = await this.cache.get(`company:id:${id}`);
    if (cacheHit) return JSON.parse(cacheHit) as Company;

    const foundedCompany = await this.prisma.company.findUnique({
      where: { id },
    });
    if (!foundedCompany) return null;

    const domainCompany = PrismaCompanyMapper.toDomain(foundedCompany);
    this.cache.set(`company:id:${id}`, JSON.stringify(domainCompany));

    return domainCompany;
  }
  async findByName(name: string): Promise<Company | null> {
    const foundedCompany = await this.prisma.company.findUnique({
      where: { name },
    });
    if (!foundedCompany) return null;
    return PrismaCompanyMapper.toDomain(foundedCompany);
  }
  async findByCnpj(cnpj: string): Promise<Company | null> {
    const foundedCompany = await this.prisma.company.findUnique({
      where: { cnpj },
    });
    if (!foundedCompany) return null;
    return PrismaCompanyMapper.toDomain(foundedCompany);
  }
  async findAll(): Promise<Company[]> {
    const companies = await this.prisma.company.findMany({
      orderBy: { name: "asc" },
    });
    return companies.map(PrismaCompanyMapper.toDomain);
  }

  async findAllWithBases(): Promise<CompanyWithBases[]> {
    const companiesWithBases = await this.prisma.company.findMany({
      include: {
        bases: {
          orderBy: { name: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });
    return companiesWithBases.map((company) =>
      PrismaCompanyMapper.toDomainWithBases(company),
    );
  }
}
