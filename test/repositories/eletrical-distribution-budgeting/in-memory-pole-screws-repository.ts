import {
  PaginationParams,
  PaginationResponseParams,
} from "src/core/repositories/pagination-params";
import {
  FetchPoleScrewsFilterOptions,
  PoleScrewsRepository,
} from "src/domain/eletrical-distribution-budgeting/application/repositories/pole-screws-repository";
import { PoleScrew } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/pole-screw";

export class InMemoryPoleScrewsRepository implements PoleScrewsRepository {
  public items: PoleScrew[] = [];
  async createMany(poleScrews: PoleScrew[]): Promise<void> {
    this.items.push(...poleScrews);
  }
  async save(poleScrew: PoleScrew): Promise<void> {
    const poleScrewToSaveIndex = this.items.findIndex(
      (item) => item.id.toString() === poleScrew.id.toString(),
    );
    if (poleScrewToSaveIndex >= 0) {
      this.items[poleScrewToSaveIndex] = poleScrew;
    }
  }
  async findById(id: string): Promise<PoleScrew | null> {
    const foundedPoleScrew = this.items.find(
      (item) => item.id.toString() === id.toString(),
    );
    return foundedPoleScrew ?? null;
  }
  async findByCode(code: number): Promise<PoleScrew | null> {
    const foundedPoleScrew = this.items.find((item) => item.code === code);
    return foundedPoleScrew ?? null;
  }
  async findAllCodes(): Promise<number[]> {
    const listOfCodes = this.items.map((item) => item.code);
    return listOfCodes;
  }
  async fetchWithFilter(
    filterOptions: FetchPoleScrewsFilterOptions,
    paginationParams: PaginationParams,
  ): Promise<{
    poleScrews: PoleScrew[];
    pagination: PaginationResponseParams;
  }> {
    const { page = 1, pageSize = 10 } = paginationParams;
    const { description, codes, maxLengthInMM, minLengthInMM } = filterOptions;
    const filteredPoleScrews = this.items.filter((poleScrew) => {
      if (description && !poleScrew.description.includes(description)) {
        return false;
      }
      if (codes && !codes.includes(poleScrew.code)) {
        return false;
      }
      if (minLengthInMM && poleScrew.lengthInMM < minLengthInMM) {
        return false;
      }
      if (maxLengthInMM && poleScrew.lengthInMM > maxLengthInMM) {
        return false;
      }
      return true;
    });
    const handedData = filteredPoleScrews
      .slice((page - 1) * pageSize, page * pageSize)
      .sort((a, b) => a.code - b.code);

    return {
      poleScrews: handedData,
      pagination: {
        actualPage: page,
        actualPageSize: pageSize,
        lastPage: Math.ceil(filteredPoleScrews.length / pageSize),
      },
    };
  }
  // Return all pole screws ordered by length in ascending order
  // for better performance when calculating budgets
  // using a binary search algorithm
  async getAllOrderedByLength(): Promise<PoleScrew[]> {
    const orderedPoleScrews = this.items.sort(
      (a, b) => a.lengthInMM - b.lengthInMM,
    );
    return orderedPoleScrews;
  }
}
