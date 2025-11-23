import { CableConnector } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/cable-connector";

export class CableConnectorPresenter {
  static toHttp(cableConnector: CableConnector) {
    return {
      id: cableConnector.id.toString(),
      code: cableConnector.code,
      description: cableConnector.description,
      unit: cableConnector.unit,
      entranceMinValueMM: cableConnector.entranceMinValueMM,
      entranceMaxValueMM: cableConnector.entranceMaxValueMM,
      exitMinValueMM: cableConnector.exitMinValueMM,
      exitMaxValueMM: cableConnector.exitMaxValueMM,
    };
  }
}
