import {
  PaginationParams,
  PaginationResponseParams,
} from "src/core/repositories/pagination-params";
import {
  CableConnectorsRepository,
  FetchCableConnectorsFilterOptions,
} from "src/domain/eletrical-distribution-budgeting/application/repositories/cable-connectors-repository";
import { CableConnector } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/cable-connector";

export class InMemoryCableConnectorsRepository
  implements CableConnectorsRepository
{
  public items: CableConnector[] = [];
  async createMany(cableConnectors: CableConnector[]): Promise<void> {
    this.items.push(...cableConnectors);
  }
  async save(cableConnector: CableConnector): Promise<void> {
    const cableConnectorToSaveIndex = this.items.findIndex(
      (item) => cableConnector.id.toString() === item.id.toString(),
    );
    if (cableConnectorToSaveIndex >= 0) {
      this.items[cableConnectorToSaveIndex] = cableConnector;
    }
  }
  async findById(id: string): Promise<CableConnector | null> {
    const foundedCableConnector = this.items.find(
      (item) => item.id.toString() === id,
    );
    return foundedCableConnector ?? null;
  }
  async findByCode(code: number): Promise<CableConnector | null> {
    const foundedCableConnector = this.items.find((item) => item.code === code);
    return foundedCableConnector ?? null;
  }
  async findAllCodes(): Promise<number[]> {
    const listOfCodes = this.items.map((item) => item.code);
    return listOfCodes;
  }
  async fetchWithFilter(
    filterOptions: FetchCableConnectorsFilterOptions,
    paginationParams: PaginationParams,
  ): Promise<{
    cableConnectors: CableConnector[];
    pagination: PaginationResponseParams;
  }> {
    const { page, pageSize } = paginationParams;
    const {
      codes,
      description,
      entranceMaxValueMM,
      entranceMinValueMM,
      exitMaxValueMM,
      exitMinValueMM,
    } = filterOptions;

    const filteredCableConnectors = this.items.filter((item) => {
      if (codes && !codes.includes(item.code)) {
        return false;
      }
      if (description && !item.description.includes(description)) {
        return false;
      }
      if (entranceMinValueMM && item.entranceMinValueMM < entranceMinValueMM) {
        return false;
      }
      if (entranceMaxValueMM && item.entranceMaxValueMM > entranceMaxValueMM) {
        return false;
      }
      if (exitMinValueMM && item.exitMinValueMM < exitMinValueMM) {
        return false;
      }
      if (exitMaxValueMM && item.exitMaxValueMM > exitMaxValueMM) {
        return false;
      }
      return true;
    });

    const handedData = filteredCableConnectors
      .slice((page - 1) * pageSize, page * pageSize)
      .sort((a, b) => a.code - b.code);
    return {
      cableConnectors: handedData,
      pagination: {
        actualPage: page,
        actualPageSize: pageSize,
        lastPage: Math.ceil(filteredCableConnectors.length / pageSize),
      },
    };
  }
  async getAllOrderedByLength(): Promise<CableConnector[]> {
    const orderedCableConnectors = this.items.sort(
      (a, b) => a.entranceMaxValueMM - b.entranceMaxValueMM,
    );
    return orderedCableConnectors;
  }
}
