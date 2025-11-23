import { Point } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/point";

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
}
