import { BasesRepository } from "src/domain/user-management/application/repositories/bases-repository";
import { Base } from "src/domain/user-management/enterprise/entities/base";

export class InMemoryBasesRepository implements BasesRepository {
  public items: Base[] = [];
  async createMany(bases: Base[]): Promise<void> {
    this.items.push(...bases);
  }
  async save(base: Base): Promise<void> {
    const baseToSaveIndex = this.items.findIndex(
      (item) => item.id.toString() === base.id.toString(),
    );
    if (baseToSaveIndex >= 0) {
      this.items[baseToSaveIndex] = base;
    }
  }
  async findByName(name: string, companyId: string): Promise<Base | null> {
    const base = this.items.find(
      (item) => item.name === name && item.companyId.toString() === companyId,
    );
    if (!base) {
      return null;
    }
    return base;
  }
  async findById(id: string): Promise<Base | null> {
    const base = this.items.find((item) => item.id.toString() === id);
    if (!base) {
      return null;
    }
    return base;
  }
  async fetchByCompanyId(companyId: string): Promise<Base[]> {
    const foundedBases = this.items
      .filter((item) => item.companyId.toString() === companyId)
      .sort((a, b) => a.name.localeCompare(b.name));
    return foundedBases;
  }
}
