import {
  PaginationParams,
  PaginationResponseParams,
} from "src/core/repositories/pagination-params";
import { UtilityPole } from "../../enterprise/entities/utility-pole";

export interface FetchUtilityPolesFilterOptions {
  codes?: number[];
  description?: string;
  minimumCountForLowVoltageLevels?: number;
  minimumCountForMediumVoltageLevels?: number;
}

export abstract class UtilityPolesRepository {
  abstract createMany(utilityPoles: UtilityPole[]): Promise<void>;
  abstract save(utilityPole: UtilityPole): Promise<void>;
  abstract findById(id: string): Promise<UtilityPole | null>;
  abstract findByIds(ids: string[]): Promise<UtilityPole[]>;
  abstract findByCode(code: number): Promise<UtilityPole | null>;
  abstract findAllCodes(): Promise<number[]>;
  abstract fetchWithFilter(
    filterOptions: FetchUtilityPolesFilterOptions,
    paginationParams: PaginationParams,
  ): Promise<{
    utilityPoles: UtilityPole[];
    pagination: PaginationResponseParams;
  }>;
}
