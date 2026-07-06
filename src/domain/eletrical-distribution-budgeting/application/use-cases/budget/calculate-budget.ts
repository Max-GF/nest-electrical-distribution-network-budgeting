import { Injectable } from "@nestjs/common";
import { Either, left, right } from "src/core/either";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { NotAllowedError } from "src/core/errors/generics/not-allowed-error";
import { ResourceNotFoundError } from "src/core/errors/generics/resource-not-found-error";
import { CableConnector } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/cable-connector";
import {
  GroupCableConnectorProps,
  GroupItem,
  GroupPoleScrewProps,
} from "src/domain/eletrical-distribution-budgeting/enterprise/entities/group-item";
import { PoleScrew } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/pole-screw";
import { Project } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/project";
import { ProjectMaterial } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/project-material";
import { CableConnectorsRepository } from "../../repositories/cable-connectors-repository";
import { PoleScrewsRepository } from "../../repositories/pole-screws-repository";
import {
  ParsedPointCables,
  ParsedPointToCreate,
  ParsedPointUtilityPole,
  ParsedSpan,
} from "../point/validate-many-points";

interface CalculateBudgetUseCaseRequest {
  project: Project;
  parsedPoints: ParsedPointToCreate[];
  parsedSpans: ParsedSpan[];
}

type CalculateBudgetUseCaseResponse = Either<
  NotAllowedError | ResourceNotFoundError,
  {
    project: Project;
    projectMaterials: ProjectMaterial[];
  }
>;

@Injectable()
export class CalculateBudgetUseCase {
  constructor(
    private poleScrewsRepository: PoleScrewsRepository,
    private cableConnectorsRepository: CableConnectorsRepository,
  ) {}

  async execute({
    project,
    parsedPoints,
    parsedSpans,
  }: CalculateBudgetUseCaseRequest): Promise<CalculateBudgetUseCaseResponse> {
    const allProjectMaterials: ProjectMaterial[] = [];

    const [orderedByLengthPoleScrews, allCableConnectors] = await Promise.all([
      this.poleScrewsRepository.getAllOrderedByLength(),
      this.cableConnectorsRepository.getAll(),
    ]);

    for (const parsedPoint of parsedPoints) {
      const calculatedMaterialsResult = await this.calculatePointMaterials({
        project,
        parsedPoint,
        orderedByLengthPoleScrews,
        allCableConnectors,
      });

      if (calculatedMaterialsResult.isLeft()) {
        return left(calculatedMaterialsResult.value);
      }

      allProjectMaterials.push(
        ...calculatedMaterialsResult.value.projectMaterials,
      );
    }

    // Cabos dos vãos — materiais avulsos sem pointId e sem groupSpecs
    const spanMaterialsResult = this.calculateSpanMaterials({
      project,
      parsedSpans,
    });

    if (spanMaterialsResult.isLeft()) {
      return left(spanMaterialsResult.value);
    }

    allProjectMaterials.push(...spanMaterialsResult.value);

    return right({
      project,
      projectMaterials: allProjectMaterials,
    });
  }

  // Gera um ProjectMaterial por vão, usando a extensão como quantidade.
  // Sem pointId e sem groupSpecs — são itens avulsos do projeto.
  private calculateSpanMaterials({
    project,
    parsedSpans,
  }: {
    project: Project;
    parsedSpans: ParsedSpan[];
  }): Either<never, ProjectMaterial[]> {
    return right(
      parsedSpans.map((span) =>
        ProjectMaterial.create({
          quantity:
            span.cable.unit.toLowerCase() === "kg" &&
            span.cable.meterToKgConversionFactor
              ? span.extension * span.cable.meterToKgConversionFactor
              : span.extension,
          itemId: span.cable.id,
          itemType: "cable",
          projectId: project.id,
          pointId: undefined,
          groupSpecs: undefined,
        }),
      ),
    );
  }

  async calculatePointMaterials({
    project,
    parsedPoint,
    orderedByLengthPoleScrews,
    allCableConnectors,
  }: {
    project: Project;
    parsedPoint: ParsedPointToCreate;
    orderedByLengthPoleScrews: PoleScrew[];
    allCableConnectors: CableConnector[];
  }): Promise<
    Either<ResourceNotFoundError, { projectMaterials: ProjectMaterial[] }>
  > {
    const pointMaterials: ProjectMaterial[] = [];
    const {
      point,
      pointCables,
      pointGroupsWithItems,
      pointUntiedMaterials,
      pointUtilityPole,
    } = parsedPoint;

    // Materiais avulsos do ponto
    pointUntiedMaterials.forEach((untiedMaterial) => {
      pointMaterials.push(
        ProjectMaterial.create({
          quantity: untiedMaterial.quantity,
          itemId: untiedMaterial.material.id,
          itemType: "material",
          projectId: project.id,
          pointId: point.id,
          groupSpecs: undefined,
        }),
      );
    });

    // Materiais de cada grupo do ponto
    for (const pointGroup of pointGroupsWithItems) {
      // Materiais avulsos do grupo
      pointGroup.untiedMaterials.forEach((untiedMaterial) => {
        pointMaterials.push(
          ProjectMaterial.create({
            quantity: untiedMaterial.quantity,
            itemId: untiedMaterial.materialId,
            itemType: "material",
            projectId: project.id,
            pointId: point.id,
            groupSpecs: {
              groupId: pointGroup.group.id,
              utilityPoleLevel: pointGroup.level,
              tensionLevel: pointGroup.tensionLevel,
            },
          }),
        );
      });

      const groupPoleScrews = await this.calculateGroupPoleScrews(
        {
          groupPoleScrews: pointGroup.poleScrews,
          pointUtilityPole: pointUtilityPole,
          tensionLevel: pointGroup.tensionLevel,
          level: pointGroup.level,
          onStrongSideDirection: pointGroup.onStrongSideDirection,
          groupId: pointGroup.group.id,
          projectId: project.id,
          pointId: point.id,
        },
        orderedByLengthPoleScrews,
      );

      if (groupPoleScrews.isLeft()) {
        return left(groupPoleScrews.value);
      }

      pointMaterials.push(...groupPoleScrews.value);

      const groupCableConnectors = await this.calculateGroupCableConnectors(
        {
          groupCableConnectors: pointGroup.cableConnectors,
          pointCables: pointCables,
          tensionLevel: pointGroup.tensionLevel,
          level: pointGroup.level,
          groupId: pointGroup.group.id,
          pointId: point.id,
          projectId: project.id,
        },
        allCableConnectors,
      );

      if (groupCableConnectors.isLeft()) {
        return left(groupCableConnectors.value);
      }

      pointMaterials.push(...groupCableConnectors.value);
    }

    // Poste, se for novo
    if (pointUtilityPole.isNew) {
      pointMaterials.push(
        ProjectMaterial.create({
          quantity: 1,
          itemId: pointUtilityPole.utilityPole.id,
          itemType: "utilityPole",
          projectId: project.id,
          pointId: point.id,
        }),
      );
    }

    // Nota: cabos não são mais inseridos aqui.
    // Eles são gerados a partir dos vãos (spans) em calculateSpanMaterials().

    return right({ projectMaterials: pointMaterials });
  }

  async calculateGroupPoleScrews(
    {
      groupId,
      projectId,
      pointId,
      groupPoleScrews,
      pointUtilityPole,
      tensionLevel,
      level,
      onStrongSideDirection,
    }: {
      groupId: UniqueEntityID;
      projectId: UniqueEntityID;
      pointId: UniqueEntityID;
      groupPoleScrews: GroupItem<GroupPoleScrewProps>[];
      pointUtilityPole: ParsedPointUtilityPole;
      tensionLevel: "LOW" | "MEDIUM";
      level: number;
      onStrongSideDirection: boolean;
    },
    orderedByLengthPoleScrews: PoleScrew[],
  ): Promise<Either<ResourceNotFoundError, ProjectMaterial[]>> {
    const calculatedGroupPoleScrews: ProjectMaterial[] = [];

    for (const poleScrewItem of groupPoleScrews) {
      const utilityLevelLengthInMM =
        pointUtilityPole.utilityPole.calculateSectionLengthInMM(
          level,
          tensionLevel,
          onStrongSideDirection,
        );

      const suitablePoleScrew = this.findSuitablePoleScrew(
        utilityLevelLengthInMM + (poleScrewItem.lengthAdd ?? 0),
        orderedByLengthPoleScrews,
      );

      if (!suitablePoleScrew) {
        return left(
          new ResourceNotFoundError(
            `No suitable pole screw found for length ${utilityLevelLengthInMM}mm`,
          ),
        );
      }

      calculatedGroupPoleScrews.push(
        ProjectMaterial.create({
          quantity: poleScrewItem.quantity,
          itemId: suitablePoleScrew.id,
          itemType: "poleScrew",
          projectId: projectId,
          pointId,
          groupSpecs: {
            groupId,
            utilityPoleLevel: level,
            tensionLevel: tensionLevel,
          },
        }),
      );
    }

    return right(calculatedGroupPoleScrews);
  }

  async calculateGroupCableConnectors(
    {
      groupId,
      projectId,
      pointId,
      groupCableConnectors,
      pointCables,
      tensionLevel,
      level,
    }: {
      groupId: UniqueEntityID;
      projectId: UniqueEntityID;
      pointId: UniqueEntityID;
      groupCableConnectors: GroupItem<GroupCableConnectorProps>[];
      pointCables: ParsedPointCables;
      tensionLevel: "LOW" | "MEDIUM";
      level: number;
    },
    allCableConnectors: CableConnector[],
  ): Promise<
    Either<ResourceNotFoundError | NotAllowedError, ProjectMaterial[]>
  > {
    const calculatedGroupCableConnectors: ProjectMaterial[] = [];

    for (const cableConnectorItem of groupCableConnectors) {
      const cablesToUse =
        tensionLevel === "LOW"
          ? pointCables.lowTensionCables
          : pointCables.mediumTensionCables;

      if (!cablesToUse) {
        return left(
          new NotAllowedError(
            `No cables available for tension level ${tensionLevel} to calculate cable connectors`,
          ),
        );
      }

      // Pegamos o ID do cabo real que está entrando
      const requiredEntranceCableId = cablesToUse.entranceCable.cable.id;

      // Definimos o ID do cabo de saída
      let requiredExitCableId: UniqueEntityID | undefined = undefined;

      if (!cableConnectorItem.oneSideConnector) {
        // Se o item de grupo exige um cabo local, nós usamos o ID desse cabo local.
        // CASO CONTRÁRIO, usamos o ID do cabo de saída da rede.
        if (cableConnectorItem.localCableId) {
          requiredExitCableId = cableConnectorItem.localCableId;
        } else if (cablesToUse.exitCable) {
          requiredExitCableId = cablesToUse.exitCable.cable.id;
        } else {
          return left(
            new NotAllowedError(
              `Exit cable or local cable is required to calculate cable connector for two-side connectors`,
            ),
          );
        }
      }

      const suitableCableConnector = this.findSuitableCableConnector(
        {
          requiredEntranceCableId,
          requiredExitCableId,
          isOneSideConnector: cableConnectorItem.oneSideConnector,
        },
        allCableConnectors,
      );

      if (!suitableCableConnector) {
        return left(
          new ResourceNotFoundError(
            `No suitable cable connector found for config: Entrance Cable ID [${requiredEntranceCableId.toString()}], Exit Cable ID [${requiredExitCableId?.toString() || "None"}]`,
          ),
        );
      }

      calculatedGroupCableConnectors.push(
        ProjectMaterial.create({
          quantity: cableConnectorItem.quantity,
          itemId: suitableCableConnector.id,
          itemType: "cableConnector",
          projectId: projectId,
          pointId: pointId,
          groupSpecs: {
            groupId,
            utilityPoleLevel: level,
            tensionLevel: tensionLevel,
          },
        }),
      );
    }

    return right(calculatedGroupCableConnectors);
  }

  private findSuitablePoleScrew(
    requiredLength: number,
    sortedPoleScrews: PoleScrew[],
  ): PoleScrew | null {
    let low = 0;
    let high = sortedPoleScrews.length - 1;
    let bestFit: PoleScrew | null = null;

    while (low <= high) {
      const mid = Math.floor(low + (high - low) / 2);
      const currentScrew = sortedPoleScrews[mid];

      if (currentScrew.lengthInMM >= requiredLength) {
        bestFit = currentScrew;
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    }

    return bestFit;
  }

  private findSuitableCableConnector(
    {
      requiredEntranceCableId,
      requiredExitCableId,
      isOneSideConnector,
    }: {
      requiredEntranceCableId: UniqueEntityID;
      requiredExitCableId?: UniqueEntityID;
      isOneSideConnector?: boolean;
    },
    allCableConnectors: CableConnector[],
  ): CableConnector | null {
    const suitableConnector = allCableConnectors.find((connector) => {
      const matchesEntrance = connector.entranceCablesOptionsIds.some((id) =>
        id.equals(requiredEntranceCableId),
      );

      if (!matchesEntrance) return false;

      if (isOneSideConnector) return true;

      if (!requiredExitCableId) return false;

      const matchesExit =
        connector.exitCablesOptionsIds?.some((id) =>
          id.equals(requiredExitCableId),
        ) || false;

      return matchesExit;
    });

    return suitableConnector || null;
  }
}
