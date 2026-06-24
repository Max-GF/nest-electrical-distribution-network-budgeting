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
} from "../point/validate-many-points";

interface CalculateBudgetUseCaseRequest {
  project: Project;
  parsedPoints: ParsedPointToCreate[];
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
  }: CalculateBudgetUseCaseRequest): Promise<CalculateBudgetUseCaseResponse> {
    const allProjectMaterials: ProjectMaterial[] = [];

    const [orderedByLengthPoleScrews, allCableConnectors] = await Promise.all([
      this.poleScrewsRepository.getAllOrderedByLength(),
      // Agora pegamos todos sem ordem específica, já que a busca é por ID exato
      this.cableConnectorsRepository.getAll(),
    ]);

    // 2. Itera sobre os pontos já parseados/validados
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

    return right({
      project,
      projectMaterials: allProjectMaterials,
    });
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

    // Adiciona os materiais avulsos do ponto (Se houver)
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

    // Adiciona os materiais avulsos de cada grupo do ponto
    for (const pointGroup of pointGroupsWithItems) {
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

    // Adiciona o poste, se ele for novo
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

    // Adiciona os cabos, se eles forem novos
    [
      pointCables.lowTensionCables?.entranceCable,
      pointCables.lowTensionCables?.exitCable,
      pointCables.mediumTensionCables?.entranceCable,
      pointCables.mediumTensionCables?.exitCable,
    ].forEach((pointCable) => {
      if (pointCable?.isNew) {
        pointMaterials.push(
          ProjectMaterial.create({
            quantity: 1,
            itemId: pointCable.cable.id,
            itemType: "cable",
            projectId: project.id,
            pointId: point.id,
          }),
        );
      }
    });

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
    }: {
      groupId: UniqueEntityID;
      projectId: UniqueEntityID;
      pointId: UniqueEntityID;
      groupPoleScrews: GroupItem<GroupPoleScrewProps>[];
      pointUtilityPole: ParsedPointUtilityPole;
      tensionLevel: "LOW" | "MEDIUM";
      level: number;
    },
    orderedByLengthPoleScrews: PoleScrew[],
  ): Promise<Either<ResourceNotFoundError, ProjectMaterial[]>> {
    // Lógica para calcular os parafusos de fixação do grupo

    const calculatedGroupPoleScrews: ProjectMaterial[] = [];

    for (const poleScrewItem of groupPoleScrews) {
      const utilityLevelLengthInMM =
        pointUtilityPole.utilityPole.calculateSectionLengthInMM(
          level,
          tensionLevel,
        );
      const suitablePoleScrew = this.findSuitablePoleScrew(
        utilityLevelLengthInMM,
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
    // Lógica para calcular os conectores de cabo do grupo

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
      // Regra 1: O conector DEVE ter o cabo de entrada nas suas opções
      const matchesEntrance = connector.entranceCablesOptionsIds.some((id) =>
        id.equals(requiredEntranceCableId),
      );

      if (!matchesEntrance) return false;

      // Regra 2: Se for conector de um lado só ("alça"/strap), fechou! É esse.
      if (isOneSideConnector) return true;

      // Regra 3: Se precisa conectar dois lados, o conector DEVE ter o cabo de saída nas opções
      if (!requiredExitCableId) return false; // Fail-safe (já testado antes, mas garante a tipagem)

      const matchesExit =
        connector.exitCablesOptionsIds?.some((id) =>
          id.equals(requiredExitCableId),
        ) || false;

      return matchesExit;
    });

    return suitableConnector || null;
  }
}
