import {
  PaginationParams,
  PaginationResponseParams,
} from "src/core/repositories/pagination-params";
import { PoleScrew } from "../../enterprise/entities/pole-screw";

export interface FetchPoleScrewsFilterOptions {
  codes?: number[];
  description?: string;
  minLengthInMM?: number;
  maxLengthInMM?: number;
}

export abstract class PoleScrewsRepository {
  abstract createMany(poleScrews: PoleScrew[]): Promise<void>;
  abstract save(poleScrew: PoleScrew): Promise<void>;
  abstract findById(id: string): Promise<PoleScrew | null>;
  abstract findByCode(code: number): Promise<PoleScrew | null>;
  abstract findAllCodes(): Promise<number[]>;
  abstract getAllOrderedByLength(): Promise<PoleScrew[]>;
  abstract fetchWithFilter(
    filterOptions: FetchPoleScrewsFilterOptions,
    paginationParams: PaginationParams,
  ): Promise<{
    poleScrews: PoleScrew[];
    pagination: PaginationResponseParams;
  }>;
}
