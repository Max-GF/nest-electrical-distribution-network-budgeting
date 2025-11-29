import { Point } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/point";
import { PointWithDetails } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/value-objects/point-with-details";
import { CablePresenter } from "./cable-presenter";
import { UtilityPolePresenter } from "./utility-pole-presenter";

export class PointPresenter {
  static toHttp(point: Point) {
    return {
      id: point.id.toString(),
      name: point.name,
      description: point.description,
      projectId: point.projectId.toString(),
      mediumTensionEntranceCableId:
        point.mediumTensionEntranceCableId?.toString() ?? null,
      mediumTensionExitCableId:
        point.mediumTensionExitCableId?.toString() ?? null,
      lowTensionEntranceCableId:
        point.lowTensionEntranceCableId?.toString() ?? null,
      lowTensionExitCableId: point.lowTensionExitCableId?.toString() ?? null,
      utilityPoleId: point.utilityPoleId?.toString() ?? null,
    };
  }

  static toHttpWithDetails(point: PointWithDetails) {
    return {
      id: point.id.toString(),
      name: point.name,
      description: point.description,
      projectId: point.project.id.toString(),
      mediumTensionEntranceCable: point.mediumTensionEntranceCable
        ? CablePresenter.toHttp(point.mediumTensionEntranceCable)
        : undefined,
      mediumTensionExitCable: point.mediumTensionExitCable
        ? CablePresenter.toHttp(point.mediumTensionExitCable)
        : undefined,
      lowTensionEntranceCable: point.lowTensionEntranceCable
        ? CablePresenter.toHttp(point.lowTensionEntranceCable)
        : undefined,
      lowTensionExitCable: point.lowTensionExitCable
        ? CablePresenter.toHttp(point.lowTensionExitCable)
        : undefined,
      utilityPole: point.utilityPole
        ? UtilityPolePresenter.toHttp(point.utilityPole)
        : undefined,
    };
  }
}
