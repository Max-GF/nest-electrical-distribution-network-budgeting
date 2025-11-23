import {
  PaginationParams,
  PaginationResponseParams,
} from "src/core/repositories/pagination-params";
import { Cable } from "../../enterprise/entities/cable";
import { TensionLevelEntries } from "../../enterprise/entities/value-objects/tension-level";

export interface FetchCablesFilterOptions {
  codes?: number[];
  description?: string;
  tension?: TensionLevelEntries;
  maxSectionAreaInMM?: number;
  minSectionAreaInMM?: number;
}

export abstract class CablesRepository {
  abstract createMany(cables: Cable[]): Promise<void>;
  abstract save(cable: Cable): Promise<void>;
  abstract findById(id: string): Promise<Cable | null>;
  abstract findByIds(ids: string[]): Promise<Cable[]>;
  abstract findByCode(code: number): Promise<Cable | null>;
  abstract findAllCodes(): Promise<number[]>;
  abstract fetchWithFilter(
    filterOptions: FetchCablesFilterOptions,
    paginationParams: PaginationParams,
  ): Promise<{
    cables: Cable[];
    pagination: PaginationResponseParams;
  }>;
}
