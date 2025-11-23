import { Base } from "../../enterprise/entities/base";

export abstract class BasesRepository {
  abstract createMany(bases: Base[]): Promise<void>;
  abstract save(base: Base): Promise<void>;
  abstract findByName(name: string, companyId: string): Promise<Base | null>;
  abstract findById(id: string): Promise<Base | null>;
  abstract fetchByCompanyId(companyId: string): Promise<Base[]>;
}
