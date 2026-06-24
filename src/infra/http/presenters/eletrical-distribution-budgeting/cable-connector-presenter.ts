import { CableConnector } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/cable-connector";
import { CableConnectorWithDetails } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/value-objects/cable-connector-with-details";
import { CablePresenter } from "./cable-presenter";

export class CableConnectorPresenter {
  static toHttp(cableConnector: CableConnector) {
    return {
      id: cableConnector.id.toString(),
      code: cableConnector.code,
      description: cableConnector.description,
      unit: cableConnector.unit,
      entranceCablesOptionsIds: cableConnector.entranceCablesOptionsIds.map(
        (id) => id.toString(),
      ),
      exitCablesOptionsIds: (cableConnector.exitCablesOptionsIds ?? []).map(
        (id) => id.toString(),
      ),
    };
  }
  static toHttpWithDetails(cableConnector: CableConnectorWithDetails) {
    return {
      id: cableConnector.id.toString(),
      code: cableConnector.code,
      description: cableConnector.description,
      unit: cableConnector.unit,
      entranceCablesOptions: cableConnector.entranceCablesOptions.map(
        CablePresenter.toHttp,
      ),
      exitCablesOptions: (cableConnector.exitCablesOptions ?? []).map(
        CablePresenter.toHttp,
      ),
    };
  }
}
