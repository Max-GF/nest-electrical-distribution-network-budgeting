import { CompaniesRepository } from "src/domain/user-management/application/repositories/companies-repository";
import { Company } from "src/domain/user-management/enterprise/entities/company";
import { CompanyWithBases } from "src/domain/user-management/enterprise/entities/value-objects/company-with-bases";
import { InMemoryBasesRepository } from "./in-memory-bases-repository";

export class InMemoryCompaniesRepository implements CompaniesRepository {
  public items: Company[] = [];
  constructor(private readonly basesRepository: InMemoryBasesRepository) {}
  async createMany(companies: Company[]): Promise<void> {
    this.items.push(...companies);
  }
  async save(company: Company): Promise<void> {
    const companyToSaveIndex = this.items.findIndex(
      (item) => item.id.toString() === company.id.toString(),
    );
    if (companyToSaveIndex >= 0) {
      this.items[companyToSaveIndex] = company;
    }
  }
  async findById(id: string): Promise<Company | null> {
    const company = this.items.find((item) => item.id.toString() === id);
    if (!company) {
      return null;
    }
    return company;
  }
  async findByName(name: string): Promise<Company | null> {
    const company = this.items.find((item) => item.name === name);
    if (!company) {
      return null;
    }
    return company;
  }
  async findByCnpj(cnpj: string): Promise<Company | null> {
    const company = this.items.find((item) => item.cnpj.value === cnpj);
    if (!company) {
      return null;
    }
    return company;
  }
  async findAll(): Promise<Company[]> {
    const sortedItems = this.items.sort((a, b) => a.name.localeCompare(b.name));

    return sortedItems;
  }
  async findAllWithBases(): Promise<CompanyWithBases[]> {
    const companies = this.items.sort((a, b) => a.name.localeCompare(b.name));

    return companies.map((company) => {
      const companyBases = this.basesRepository.items.filter(
        (base) => base.companyId.toString() === company.id.toString(),
      );
      return CompanyWithBases.create({
        id: company.id.toString(),
        name: company.name,
        cnpj: company.cnpj.value,
        bases: companyBases,
      });
    });
  }
}
