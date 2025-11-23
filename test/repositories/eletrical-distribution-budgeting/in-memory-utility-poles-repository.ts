import {
  PaginationParams,
  PaginationResponseParams,
} from "src/core/repositories/pagination-params";
import {
  FetchUtilityPolesFilterOptions,
  UtilityPolesRepository,
} from "src/domain/eletrical-distribution-budgeting/application/repositories/utility-poles-repository";
import { UtilityPole } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/utility-pole";

export class InMemoryUtilityPolesRepository implements UtilityPolesRepository {
  public items: UtilityPole[] = [];
  async createMany(utilityPoles: UtilityPole[]): Promise<void> {
    this.items.push(...utilityPoles);
  }
  async save(utilityPole: UtilityPole): Promise<void> {
    const utilityPoleToSaveIndex = this.items.findIndex(
      (item) => item.id.toString() === utilityPole.id.toString(),
    );
    if (utilityPoleToSaveIndex >= 0) {
      this.items[utilityPoleToSaveIndex] = utilityPole;
    }
  }
  async findById(id: string): Promise<UtilityPole | null> {
    const foundUtilityPole = this.items.find(
      (item) => item.id.toString() === id.toString(),
    );
    return foundUtilityPole ?? null;
  }

  async findByCode(code: number): Promise<UtilityPole | null> {
    const foundUtilityPole = this.items.find((item) => item.code === code);
    return foundUtilityPole ?? null;
  }
  async findAllCodes(): Promise<number[]> {
    const listOfCodes = this.items.map((item) => item.code);
    return listOfCodes;
  }
  async fetchWithFilter(
    filterOptions: FetchUtilityPolesFilterOptions,
    paginationParams: PaginationParams,
  ): Promise<{
    utilityPoles: UtilityPole[];
    pagination: PaginationResponseParams;
  }> {
    const { page, pageSize } = paginationParams;
    const {
      codes,
      description,
      minimumCountForLowVoltageLevels,
      minimumCountForMediumVoltageLevels,
    } = filterOptions;
    const filteredUtilityPoles = this.items.filter((item) => {
      if (codes && !codes.includes(item.code)) {
        return false;
      }
      if (description && !item.description.includes(description)) {
        return false;
      }
      if (
        minimumCountForLowVoltageLevels &&
        minimumCountForLowVoltageLevels > item.lowVoltageLevelsCount
      ) {
        return false;
      }
      if (
        minimumCountForMediumVoltageLevels &&
        minimumCountForMediumVoltageLevels > item.mediumVoltageLevelsCount
      ) {
        return false;
      }
      return true;
    });
    const handedData = filteredUtilityPoles
      .slice((page - 1) * pageSize, page * pageSize)
      .sort((a, b) => a.code - b.code);

    return {
      utilityPoles: handedData,
      pagination: {
        actualPage: page,
        actualPageSize: pageSize,
        lastPage: Math.ceil(filteredUtilityPoles.length / pageSize),
      },
    };
  }
  async findByIds(ids: string[]): Promise<UtilityPole[]> {
    const foundUtilityPoles = this.items.filter((item) =>
      ids.includes(item.id.toString()),
    );
    return foundUtilityPoles;
  }
}
