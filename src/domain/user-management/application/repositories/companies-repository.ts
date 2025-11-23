import { Company } from "../../enterprise/entities/company";
import { CompanyWithBases } from "../../enterprise/entities/value-objects/company-with-bases";

export abstract class CompaniesRepository {
  abstract createMany(companies: Company[]): Promise<void>;
  abstract save(company: Company): Promise<void>;
  abstract findById(id: string): Promise<Company | null>;
  abstract findByName(name: string): Promise<Company | null>;
  abstract findByCnpj(cnpj: string): Promise<Company | null>;
  abstract findAll(): Promise<Company[]>;
  abstract findAllWithBases(): Promise<CompanyWithBases[]>;
}
