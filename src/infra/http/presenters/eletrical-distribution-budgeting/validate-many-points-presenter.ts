import { ParsedPointToCreate } from "src/domain/eletrical-distribution-budgeting/application/use-cases/point/validate-many-points";
import { CablePresenter } from "./cable-presenter";
import { PointPresenter } from "./point-presenter";
import { UtilityPolePresenter } from "./utility-pole-presenter";

export class ValidateManyPointsPresenter {
  static toHttp(parsedPoint: ParsedPointToCreate) {
    return {
      point: PointPresenter.toHttp(parsedPoint.point),
      pointUtilityPole: {
        isNew: parsedPoint.pointUtilityPole.isNew,
        utilityPole: UtilityPolePresenter.toHttp(
          parsedPoint.pointUtilityPole.utilityPole,
        ),
      },
      pointCables: {
        lowTensionCables: parsedPoint.pointCables.lowTensionCables
          ? {
              entranceCable: {
                isNew:
                  parsedPoint.pointCables.lowTensionCables.entranceCable.isNew,
                cable: CablePresenter.toHttp(
                  parsedPoint.pointCables.lowTensionCables.entranceCable.cable,
                ),
              },
              exitCable: parsedPoint.pointCables.lowTensionCables.exitCable
                ? {
                    isNew:
                      parsedPoint.pointCables.lowTensionCables.exitCable.isNew,
                    cable: CablePresenter.toHttp(
                      parsedPoint.pointCables.lowTensionCables.exitCable.cable,
                    ),
                  }
                : undefined,
            }
          : undefined,
        mediumTensionCables: parsedPoint.pointCables.mediumTensionCables
          ? {
              entranceCable: {
                isNew:
                  parsedPoint.pointCables.mediumTensionCables.entranceCable
                    .isNew,
                cable: CablePresenter.toHttp(
                  parsedPoint.pointCables.mediumTensionCables.entranceCable
                    .cable,
                ),
              },
              exitCable: parsedPoint.pointCables.mediumTensionCables.exitCable
                ? {
                    isNew:
                      parsedPoint.pointCables.mediumTensionCables.exitCable
                        .isNew,
                    cable: CablePresenter.toHttp(
                      parsedPoint.pointCables.mediumTensionCables.exitCable
                        .cable,
                    ),
                  }
                : undefined,
            }
          : undefined,
      },
      pointGroupsWithItems: parsedPoint.pointGroupsWithItems.map((group) => ({
        tensionLevel: group.tensionLevel,
        level: group.level,
        groupName: group.group.name,
      })),
      pointUntiedMaterials: parsedPoint.pointUntiedMaterials.map((item) => ({
        quantity: item.quantity,
        materialName: item.material.description,
      })),
    };
  }
}
