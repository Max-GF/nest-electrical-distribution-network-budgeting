import {
  PaginationParams,
  PaginationResponseParams,
} from "src/core/repositories/pagination-params";
import {
  CablesRepository,
  FetchCablesFilterOptions,
} from "src/domain/eletrical-distribution-budgeting/application/repositories/cables-repository";
import { Cable } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/cable";

export class InMemoryCablesRepository implements CablesRepository {
  public items: Cable[] = [];
  async createMany(cables: Cable[]): Promise<void> {
    this.items.push(...cables);
  }
  async save(cable: Cable): Promise<void> {
    const cableToSaveIndex = this.items.findIndex(
      (item) => item.id.toString() === cable.id.toString(),
    );
    if (cableToSaveIndex >= 0) {
      this.items[cableToSaveIndex] = cable;
    }
  }
  async findById(id: string): Promise<Cable | null> {
    const foundedCable = this.items.find((item) => item.id.toString() === id);
    return foundedCable ?? null;
  }
  async findByCode(code: number): Promise<Cable | null> {
    const foundedCable = this.items.find((item) => item.code === code);
    return foundedCable ?? null;
  }
  async findAllCodes(): Promise<number[]> {
    const listOfCodes = this.items.map((item) => item.code);
    return listOfCodes;
  }
  async fetchWithFilter(
    filterOptions: FetchCablesFilterOptions,
    paginationParams: PaginationParams,
  ): Promise<{ cables: Cable[]; pagination: PaginationResponseParams }> {
    const { page, pageSize } = paginationParams;
    const {
      codes,
      description,
      minSectionAreaInMM,
      maxSectionAreaInMM,
      tension,
    } = filterOptions;
    const filteredCables = this.items.filter((cable) => {
      if (codes && !codes.includes(cable.code)) {
        return false;
      }
      if (description && !cable.description.includes(description)) {
        return false;
      }
      if (minSectionAreaInMM && cable.sectionAreaInMM < minSectionAreaInMM) {
        return false;
      }
      if (maxSectionAreaInMM && cable.sectionAreaInMM > maxSectionAreaInMM) {
        return false;
      }
      if (tension && cable.tension.value !== tension) {
        return false;
      }
      return true;
    });
    const handedData = filteredCables
      .slice((page - 1) * pageSize, page * pageSize)
      .sort((a, b) => a.code - b.code);
    return {
      cables: handedData,
      pagination: {
        actualPage: page,
        actualPageSize: pageSize,
        lastPage: Math.ceil(filteredCables.length / pageSize),
      },
    };
  }
  async findByIds(ids: string[]): Promise<Cable[]> {
    const foundCables = this.items.filter((item) =>
      ids.includes(item.id.toString()),
    );
    return foundCables;
  }
}
