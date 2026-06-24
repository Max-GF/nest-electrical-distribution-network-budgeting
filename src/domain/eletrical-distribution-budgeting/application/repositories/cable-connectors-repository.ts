import {
  PaginationParams,
  PaginationResponseParams,
} from "src/core/repositories/pagination-params";
import { CableConnector } from "../../enterprise/entities/cable-connector";

export interface FetchCableConnectorsFilterOptions {
  codes?: number[];
  description?: string;
}

export abstract class CableConnectorsRepository {
  abstract createMany(cableConnectors: CableConnector[]): Promise<void>;
  abstract save(cableConnector: CableConnector): Promise<void>;
  abstract findById(id: string): Promise<CableConnector | null>;
  abstract findByCode(code: number): Promise<CableConnector | null>;
  abstract findByCodes(codes: number[]): Promise<CableConnector[]>;
  abstract fetchWithFilter(
    filterOptions: FetchCableConnectorsFilterOptions,
    paginationParams: PaginationParams,
  ): Promise<{
    cableConnectors: CableConnector[];
    pagination: PaginationResponseParams;
  }>;
}
