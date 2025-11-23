import {
  PaginationParams,
  PaginationResponseParams,
} from "src/core/repositories/pagination-params";
import {
  FetchMaterialsFilterOptions,
  MaterialsRepository,
} from "src/domain/eletrical-distribution-budgeting/application/repositories/materials-repository";
import { Material } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/material";

export class InMemoryMaterialsRepository implements MaterialsRepository {
  public items: Material[] = [];
  async createMany(materials: Material[]): Promise<void> {
    this.items.push(...materials);
  }
  async save(material: Material): Promise<void> {
    const materialToSaveIndex = this.items.findIndex(
      (item) => item.id.toString() === material.id.toString(),
    );
    if (materialToSaveIndex >= 0) {
      this.items[materialToSaveIndex] = material;
    }
  }
  async findById(id: string): Promise<Material | null> {
    const foundedMaterial = this.items.find(
      (item) => item.id.toString() === id.toString(),
    );
    return foundedMaterial ?? null;
  }
  async findByIds(ids: string[]): Promise<Material[]> {
    const foundedMaterials = this.items.filter((item) =>
      ids.includes(item.id.toString()),
    );
    return foundedMaterials;
  }
  async findByCode(code: number): Promise<Material | null> {
    const foundedMaterial = this.items.find((item) => item.code === code);
    return foundedMaterial ?? null;
  }
  async findAllCodes(): Promise<number[]> {
    const listOfCodes = this.items.map((item) => item.code);
    return listOfCodes;
  }
  async fetchWithFilter(
    filterOptions: FetchMaterialsFilterOptions,
    paginationParams: PaginationParams,
  ): Promise<{
    materials: Material[];
    pagination: PaginationResponseParams;
  }> {
    const { page, pageSize } = paginationParams;
    const { description, codes, tension } = filterOptions;
    const filteredMaterials = this.items.filter((material) => {
      if (description && !material.description.includes(description)) {
        return false;
      }
      if (codes && !codes.includes(material.code)) {
        return false;
      }
      if (tension && material.tension.value !== tension) {
        return false;
      }
      return true;
    });
    const handedData = filteredMaterials
      .slice((page - 1) * pageSize, page * pageSize)
      .sort((a, b) => a.code - b.code);

    return {
      materials: handedData,
      pagination: {
        actualPage: page,
        actualPageSize: pageSize,
        lastPage: Math.ceil(filteredMaterials.length / pageSize),
      },
    };
  }
}
