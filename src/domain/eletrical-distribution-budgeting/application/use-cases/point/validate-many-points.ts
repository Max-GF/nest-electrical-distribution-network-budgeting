import { Injectable } from "@nestjs/common";
import { Either, left, right } from "src/core/either";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { AlreadyRegisteredError } from "src/core/errors/generics/already-registered-error";
import { NotAllowedError } from "src/core/errors/generics/not-allowed-error";
import { ResourceNotFoundError } from "src/core/errors/generics/resource-not-found-error";
import { Cable } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/cable";
import { Group } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/group";
import {
  GroupCableConnectorProps,
  GroupItem,
  GroupMaterialProps,
  GroupPoleScrewProps,
} from "src/domain/eletrical-distribution-budgeting/enterprise/entities/group-item";
import { Material } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/material";
import { Point } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/point";
import { Project } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/project";
import { UtilityPole } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/utility-pole";
import { CablesRepository } from "../../repositories/cables-repository";
import { GroupItemsRepository } from "../../repositories/group-items-repository";
import { GroupsRepository } from "../../repositories/groups-repository";
import { MaterialsRepository } from "../../repositories/materials-repository";
import { PointsRepository } from "../../repositories/points-repository";
import { ProjectsRepository } from "../../repositories/projects-repository";
import { UtilityPolesRepository } from "../../repositories/utility-poles-repository";

export interface ValidateManyPointsUseCaseRequest {
  projectId: string;
  points: PointToValidateRequest[];
}

interface PointToValidateRequest {
  name: string;
  description?: string;
  pointUtilityPole: PointUtilityPoleRequest;
  pointCables: PointCablesRequest;
  pointGroups?: PointGroupRequest[];
  untiedMaterials?: { quantity: number; materialId: string }[];
}

interface PointCablesRequest {
  lowTensionCables?: {
    entranceCable: {
      isNew: boolean;
      cableId: string;
    };
    exitCable?: {
      isNew: boolean;
      cableId: string;
    };
  };
  mediumTensionCables?: {
    entranceCable: {
      isNew: boolean;
      cableId: string;
    };
    exitCable?: {
      isNew: boolean;
      cableId: string;
    };
  };
}

export interface ParsedPointCables {
  lowTensionCables?: {
    entranceCable: {
      isNew: boolean;
      cable: Cable;
    };
    exitCable?: {
      isNew: boolean;
      cable: Cable;
    };
  };
  mediumTensionCables?: {
    entranceCable: {
      isNew: boolean;
      cable: Cable;
    };
    exitCable?: {
      isNew: boolean;
      cable: Cable;
    };
  };
}
interface PointUtilityPoleRequest {
  isNew: boolean;
  utilityPoleId: string;
}
export interface ParsedPointUtilityPole {
  isNew: boolean;
  utilityPole: UtilityPole;
}
interface PointGroupRequest {
  tensionLevel: "LOW" | "MEDIUM";
  level: number;
  groupId: string;
}
interface ParsedPointGroup extends GroupWithSeparatedItems {
  tensionLevel: "LOW" | "MEDIUM";
  level: number;
}

interface GroupWithSeparatedItems {
  group: Group;
  untiedMaterials: GroupItem<GroupMaterialProps>[];
  cableConnectors: GroupItem<GroupCableConnectorProps>[];
  poleScrews: GroupItem<GroupPoleScrewProps>[];
}

export interface ParsedPointToCreate {
  point: Point;
  pointUtilityPole: ParsedPointUtilityPole;
  pointCables: ParsedPointCables;
  pointGroupsWithItems: ParsedPointGroup[];
  pointUntiedMaterials: { quantity: number; material: Material }[];
}

type ValidateManyPointsUseCaseResponse = Either<
  AlreadyRegisteredError | ResourceNotFoundError | NotAllowedError,
  {
    project: Project;
    parsedPoints: ParsedPointToCreate[];
  }
>;

@Injectable()
export class ValidateManyPointsUseCase {
  constructor(
    private pointsRepository: PointsRepository,
    private projectsRepository: ProjectsRepository,
    private utilityPolesRepository: UtilityPolesRepository,
    private cablesRepository: CablesRepository,
    private materialsRepository: MaterialsRepository,
    private groupsRepository: GroupsRepository,
    private groupItemsRepository: GroupItemsRepository,
  ) {}

  async execute({
    points,
    projectId,
  }: ValidateManyPointsUseCaseRequest): Promise<ValidateManyPointsUseCaseResponse> {
    const pointsInfosToValidadeChecks =
      this.getAllPointsInfosToValidate(points);

    if (pointsInfosToValidadeChecks.isLeft()) {
      return left(pointsInfosToValidadeChecks.value); // Basicantente, erro de nome duplicado na requisição
    }
    const {
      pointsNames,
      pointsUtilityPoleIds,
      pointsCablesIds,
      pointsGroupsIds,
      pointsUntiedMaterialsIds,
    } = pointsInfosToValidadeChecks.value;

    const [
      projectChecks,
      namesChecks,
      utilityPolesIdChecks,
      cablesIdsChecks,
      groupsIdsChecks,
      untiedMaterialsIdsChecks,
    ] = await Promise.all([
      this.performAllProjectChecks(projectId),
      this.performAllNamesDuplicateChecks(pointsNames, projectId),
      this.checkAllUtilityPolesIds(pointsUtilityPoleIds),
      this.checkAllCablesIds(pointsCablesIds),
      this.checkAllGroupsIds(pointsGroupsIds),
      this.checkAllUntiedMaterialsIds(pointsUntiedMaterialsIds),
    ]);

    if (projectChecks.isLeft()) {
      return left(projectChecks.value);
    }
    if (namesChecks.isLeft()) {
      return left(namesChecks.value);
    }
    if (utilityPolesIdChecks.isLeft()) {
      return left(utilityPolesIdChecks.value);
    }
    if (cablesIdsChecks.isLeft()) {
      return left(cablesIdsChecks.value);
    }
    if (groupsIdsChecks.isLeft()) {
      return left(groupsIdsChecks.value);
    }
    if (untiedMaterialsIdsChecks.isLeft()) {
      return left(untiedMaterialsIdsChecks.value);
    }

    const pointsGroupCountCheck = await this.checkPointsGroupsCount(
      points,
      utilityPolesIdChecks.value.utilityPolesMapById,
    );

    if (pointsGroupCountCheck.isLeft()) {
      return left(pointsGroupCountCheck.value);
    }

    const parsedPointsToCreate = this.parsePointsToCreate({
      projectId,
      points,
      utilityPolesMapById: utilityPolesIdChecks.value.utilityPolesMapById,
      cablesMapById: cablesIdsChecks.value.cablesMapById,
      groupsMapById: groupsIdsChecks.value.groupsMapById,
      materialsMapById: untiedMaterialsIdsChecks.value.materialsMapById,
    });
    if (parsedPointsToCreate.isLeft()) {
      return left(parsedPointsToCreate.value);
    }

    return right({
      project: projectChecks.value.project,
      parsedPoints: parsedPointsToCreate.value,
    });
  }

  async performAllProjectChecks(
    projectId: string,
  ): Promise<Either<ResourceNotFoundError, { project: Project }>> {
    const project = await this.projectsRepository.findById(projectId);
    if (!project) {
      return left(new ResourceNotFoundError("Project does not exist"));
    }
    return right({ project });
  }

  getAllPointsInfosToValidate(points: PointToValidateRequest[]): Either<
    AlreadyRegisteredError,
    {
      pointsNames: string[];
      pointsUtilityPoleIds: string[];
      pointsCablesIds: string[];
      pointsGroupsIds: string[];
      pointsUntiedMaterialsIds: string[];
    }
  > {
    const pointsNamesSet = new Set<string>();
    const pointsUtilityPoleIdsSet = new Set<string>();
    const pointsCablesIdsSet = new Set<string>();
    const pointsGroupsIdsSet = new Set<string>();
    const pointsUntiedMaterialsIdsSet = new Set<string>();

    for (const point of points) {
      // Check for duplicate point names
      if (pointsNamesSet.has(point.name)) {
        return left(
          new NotAllowedError(`Duplicate point name found: ${point.name}`),
        );
      }
      pointsNamesSet.add(point.name);
      pointsUtilityPoleIdsSet.add(point.pointUtilityPole.utilityPoleId);

      if (point.pointCables.lowTensionCables) {
        pointsCablesIdsSet.add(
          point.pointCables.lowTensionCables.entranceCable.cableId,
        );
        if (point.pointCables.lowTensionCables.exitCable) {
          pointsCablesIdsSet.add(
            point.pointCables.lowTensionCables.exitCable.cableId,
          );
        }
      }
      if (point.pointCables.mediumTensionCables) {
        pointsCablesIdsSet.add(
          point.pointCables.mediumTensionCables.entranceCable.cableId,
        );
        if (point.pointCables.mediumTensionCables.exitCable) {
          pointsCablesIdsSet.add(
            point.pointCables.mediumTensionCables.exitCable.cableId,
          );
        }
      }
      if (point.pointGroups) {
        const levelsSet = new Set<string>();
        for (const group of point.pointGroups) {
          if (levelsSet.has(`${group.tensionLevel}-${group.level}`)) {
            return left(
              new AlreadyRegisteredError(
                `Duplicate group level ${group.level} found for tension level ${group.tensionLevel}`,
              ),
            );
          }
          levelsSet.add(`${group.tensionLevel}-${group.level}`);
          pointsGroupsIdsSet.add(group.groupId);
        }
      }
      if (point.untiedMaterials) {
        point.untiedMaterials.forEach((material) => {
          pointsUntiedMaterialsIdsSet.add(material.materialId);
        });
      }
    }
    return right({
      pointsNames: Array.from(pointsNamesSet),
      pointsUtilityPoleIds: Array.from(pointsUtilityPoleIdsSet),
      pointsCablesIds: Array.from(pointsCablesIdsSet),
      pointsGroupsIds: Array.from(pointsGroupsIdsSet),
      pointsUntiedMaterialsIds: Array.from(pointsUntiedMaterialsIdsSet),
    });
  }
  async performAllNamesDuplicateChecks(
    pointsNames: string[],
    projectId: string,
  ): Promise<Either<AlreadyRegisteredError, null>> {
    const projectsAlreadyRegisteredNames =
      await this.pointsRepository.findByProjectIdAndNames(
        projectId,
        pointsNames,
      );
    if (projectsAlreadyRegisteredNames.length > 0) {
      const duplicateNames = projectsAlreadyRegisteredNames
        .map((point) => point.name)
        .join(", ");
      return left(
        new AlreadyRegisteredError(
          `Point names already registered in this project: ${duplicateNames}`,
        ),
      );
    }
    return right(null);
  }
  async checkAllUtilityPolesIds(
    pointsUtilityPoleIds: string[],
  ): Promise<
    Either<
      ResourceNotFoundError,
      { utilityPolesMapById: Map<string, UtilityPole> }
    >
  > {
    if (pointsUtilityPoleIds.length === 0) {
      return right({ utilityPolesMapById: new Map() });
    }
    const utilityPoles =
      await this.utilityPolesRepository.findByIds(pointsUtilityPoleIds);

    const mapOfUtilityPolesById = new Map<string, UtilityPole>(
      utilityPoles.map((pole) => [pole.id.toString(), pole]),
    );
    if (utilityPoles.length !== pointsUtilityPoleIds.length) {
      const missingUtilityPoleIds = pointsUtilityPoleIds.filter(
        (id) => !mapOfUtilityPolesById.has(id),
      );
      return left(
        new ResourceNotFoundError(
          `Utility poles not found for IDs: ${missingUtilityPoleIds.join(", ")}`,
        ),
      );
    }
    return right({ utilityPolesMapById: mapOfUtilityPolesById });
  }
  async checkAllCablesIds(
    pointsCablesIds: string[],
  ): Promise<
    Either<ResourceNotFoundError, { cablesMapById: Map<string, Cable> }>
  > {
    if (pointsCablesIds.length === 0) {
      return right({ cablesMapById: new Map() });
    }
    const cables = await this.cablesRepository.findByIds(pointsCablesIds);
    const mapOfCablesById = new Map<string, Cable>(
      cables.map((cable) => [cable.id.toString(), cable]),
    );
    if (cables.length !== pointsCablesIds.length) {
      const missingCableIds = pointsCablesIds.filter(
        (id) => !mapOfCablesById.has(id),
      );
      return left(
        new ResourceNotFoundError(
          `Cables not found for IDs: ${missingCableIds.join(", ")}`,
        ),
      );
    }
    return right({ cablesMapById: mapOfCablesById });
  }
  async checkAllGroupsIds(
    pointsGroupsIds: string[],
  ): Promise<
    Either<
      ResourceNotFoundError,
      { groupsMapById: Map<string, GroupWithSeparatedItems> }
    >
  > {
    if (pointsGroupsIds.length === 0) {
      return right({ groupsMapById: new Map() });
    }
    const groups = await this.groupsRepository.findByIds(pointsGroupsIds);
    const groupsItems =
      await this.groupItemsRepository.findByManyGroupsIds(pointsGroupsIds);
    const itemsSeparetedByGroupId = new Map<
      string,
      Omit<GroupWithSeparatedItems, "group">
    >();

    groupsItems.forEach((item) => {
      const groupId = item.groupId.toString();
      const respectiveGroupItems: Omit<GroupWithSeparatedItems, "group"> =
        itemsSeparetedByGroupId.get(groupId) || {
          untiedMaterials: [],
          cableConnectors: [],
          poleScrews: [],
        };

      if (item.isMaterial()) {
        respectiveGroupItems.untiedMaterials.push(item);
      } else if (item.isCableConnector()) {
        respectiveGroupItems.cableConnectors.push(item);
      } else if (item.isPoleScrew()) {
        respectiveGroupItems.poleScrews.push(item);
      }
      itemsSeparetedByGroupId.set(groupId, respectiveGroupItems);
    });

    const mapOfGroupsById = new Map<string, GroupWithSeparatedItems>(
      groups.map((group) => {
        const groupId = group.id.toString();
        const groupSeparetedItems = itemsSeparetedByGroupId.get(groupId) || {
          untiedMaterials: [],
          cableConnectors: [],
          poleScrews: [],
        };

        return [
          group.id.toString(),
          {
            group,
            ...groupSeparetedItems,
          },
        ];
      }),
    );

    if (groups.length !== pointsGroupsIds.length) {
      const missingGroupIds = pointsGroupsIds.filter(
        (id) => !mapOfGroupsById.has(id),
      );
      return left(
        new ResourceNotFoundError(
          `Groups not found for IDs: ${missingGroupIds.join(", ")}`,
        ),
      );
    }

    return right({ groupsMapById: mapOfGroupsById });
  }
  async checkAllUntiedMaterialsIds(
    pointsUntiedMaterialsIds: string[],
  ): Promise<
    Either<ResourceNotFoundError, { materialsMapById: Map<string, Material> }>
  > {
    if (pointsUntiedMaterialsIds.length === 0) {
      return right({ materialsMapById: new Map() });
    }
    const materials = await this.materialsRepository.findByIds(
      pointsUntiedMaterialsIds,
    );
    const mapOfMaterialsById = new Map<string, Material>(
      materials.map((material) => [material.id.toString(), material]),
    );
    if (materials.length !== pointsUntiedMaterialsIds.length) {
      const missingMaterialIds = pointsUntiedMaterialsIds.filter(
        (id) => !mapOfMaterialsById.has(id),
      );
      return left(
        new ResourceNotFoundError(
          `Materials not found for IDs: ${missingMaterialIds.join(", ")}`,
        ),
      );
    }
    return right({ materialsMapById: mapOfMaterialsById });
  }

  checkPointsGroupsCount(
    points: PointToValidateRequest[],
    utilityPolesMapById: Map<string, UtilityPole>,
  ): Either<NotAllowedError, null> {
    for (const point of points) {
      if (!point.pointGroups || point.pointGroups.length === 0) {
        continue;
      }
      const utilityPole = utilityPolesMapById.get(
        point.pointUtilityPole.utilityPoleId,
      );
      if (!utilityPole) {
        return left(
          new NotAllowedError(
            "Server Error: Utility pole not found for point, this should not happen",
          ),
        );
      }

      const groupCountByTension = point.pointGroups.reduce(
        (counts, group) => {
          counts[group.tensionLevel.toLowerCase()]++;
          return counts;
        },
        { low: 0, medium: 0 },
      );
      if (groupCountByTension.low > utilityPole.lowVoltageLevelsCount) {
        return left(
          new NotAllowedError(
            `Point "${point.name}" has more low tension groups than supported by the utility pole`,
          ),
        );
      }
      if (groupCountByTension.medium > utilityPole.mediumVoltageLevelsCount) {
        return left(
          new NotAllowedError(
            `Point "${point.name}" has more medium tension groups than supported by the utility pole`,
          ),
        );
      }
    }
    return right(null);
  }
  parsePointsToCreate({
    projectId,
    points,
    utilityPolesMapById,
    cablesMapById,
    groupsMapById,
    materialsMapById,
  }: {
    projectId: string;
    points: PointToValidateRequest[];
    utilityPolesMapById: Map<string, UtilityPole>;
    cablesMapById: Map<string, Cable>;
    groupsMapById: Map<string, GroupWithSeparatedItems>;
    materialsMapById: Map<string, Material>;
  }): Either<NotAllowedError, ParsedPointToCreate[]> {
    const parsedPointsToCreate: ParsedPointToCreate[] = [];
    for (const point of points) {
      // Parse Point Utility Pole
      const utilityPoleParseCheck = this.parsePointUtilityPole(
        point.pointUtilityPole,
        utilityPolesMapById,
      );
      if (utilityPoleParseCheck.isLeft()) {
        return left(utilityPoleParseCheck.value);
      }
      const parsedUtilityPole = utilityPoleParseCheck.value;

      const cablesParseCheck = this.parsePointCables(
        point.pointCables,
        cablesMapById,
      );
      if (cablesParseCheck.isLeft()) {
        return left(cablesParseCheck.value);
      }
      const pointCables = cablesParseCheck.value;

      const groupsParseCheck = this.parsePointGroups(
        point.pointGroups,
        groupsMapById,
      );
      if (groupsParseCheck.isLeft()) {
        return left(groupsParseCheck.value);
      }
      const pointGroups = groupsParseCheck.value;

      const untiedMaterialsParseCheck = this.parsePointUntiedMaterials(
        point.untiedMaterials,
        materialsMapById,
      );
      if (untiedMaterialsParseCheck.isLeft()) {
        return left(untiedMaterialsParseCheck.value);
      }
      const pointUntiedMaterials = untiedMaterialsParseCheck.value;

      const pointToCreate = Point.create({
        name: point.name,
        projectId: new UniqueEntityID(projectId),
        description: point.description,
        lowTensionEntranceCableId:
          pointCables.lowTensionCables?.entranceCable.cable.id,
        lowTensionExitCableId:
          pointCables.lowTensionCables?.exitCable?.cable.id,
        mediumTensionEntranceCableId:
          pointCables.mediumTensionCables?.entranceCable.cable.id,
        mediumTensionExitCableId:
          pointCables.mediumTensionCables?.exitCable?.cable.id,
        utilityPoleId: parsedUtilityPole.utilityPole.id,
      });

      parsedPointsToCreate.push({
        point: pointToCreate,
        pointUtilityPole: parsedUtilityPole,
        pointCables,
        pointGroupsWithItems: pointGroups,
        pointUntiedMaterials,
      });
    }
    return right(parsedPointsToCreate);
  }

  parsePointUtilityPole(
    pointUtilityPoleReq: PointUtilityPoleRequest,
    utilityPolesMapById: Map<string, UtilityPole>,
  ): Either<NotAllowedError, ParsedPointUtilityPole> {
    const utilityPole = utilityPolesMapById.get(
      pointUtilityPoleReq.utilityPoleId,
    );
    if (!utilityPole) {
      return left(
        new NotAllowedError(
          "Server Error: Utility pole not found for point, this should not happen",
        ),
      );
    }
    return right({
      utilityPole,
      isNew: pointUtilityPoleReq.isNew,
    });
  }
  parsePointCables(
    pointCablesReq: PointCablesRequest,
    cablesMapById: Map<string, Cable>,
  ): Either<NotAllowedError, ParsedPointCables> {
    let parsedLowCables:
      | {
          entranceCable: { cable: Cable; isNew: boolean };
          exitCable?: { cable: Cable; isNew: boolean };
        }
      | undefined = undefined;
    let parsedMediumCables:
      | {
          entranceCable: { cable: Cable; isNew: boolean };
          exitCable?: { cable: Cable; isNew: boolean };
        }
      | undefined = undefined;

    if (pointCablesReq.lowTensionCables) {
      const entranceCable = cablesMapById.get(
        pointCablesReq.lowTensionCables.entranceCable.cableId,
      );
      if (!entranceCable) {
        return left(
          new NotAllowedError(
            "Server Error: Low tension entrance cable not found for point, this should not happen",
          ),
        );
      }
      parsedLowCables = {
        entranceCable: {
          cable: entranceCable,
          isNew: pointCablesReq.lowTensionCables.entranceCable.isNew,
        },
      };

      if (pointCablesReq.lowTensionCables.exitCable) {
        const exitCable = cablesMapById.get(
          pointCablesReq.lowTensionCables.exitCable.cableId,
        );
        if (!exitCable) {
          return left(
            new NotAllowedError(
              "Server Error: Low tension exit cable not found for point, this should not happen",
            ),
          );
        }
        parsedLowCables.exitCable = {
          cable: exitCable,
          isNew: pointCablesReq.lowTensionCables.exitCable.isNew,
        };
      }
    }

    if (pointCablesReq.mediumTensionCables) {
      const entranceCable = cablesMapById.get(
        pointCablesReq.mediumTensionCables.entranceCable.cableId,
      );
      if (!entranceCable) {
        return left(
          new NotAllowedError(
            "Server Error: Medium tension entrance cable not found for point, this should not happen",
          ),
        );
      }
      parsedMediumCables = {
        entranceCable: {
          cable: entranceCable,
          isNew: pointCablesReq.mediumTensionCables.entranceCable.isNew,
        },
      };

      if (pointCablesReq.mediumTensionCables.exitCable) {
        const exitCable = cablesMapById.get(
          pointCablesReq.mediumTensionCables.exitCable.cableId,
        );
        if (!exitCable) {
          return left(
            new NotAllowedError(
              "Server Error: Low tension exit cable not found for point, this should not happen",
            ),
          );
        }
        parsedMediumCables.exitCable = {
          cable: exitCable,
          isNew: pointCablesReq.mediumTensionCables.exitCable.isNew,
        };
      }
    }

    return right({
      lowTensionCables: parsedLowCables,
      mediumTensionCables: parsedMediumCables,
    });
  }
  parsePointGroups(
    pointGroupsReq: PointGroupRequest[] | undefined,
    groupsMapById: Map<string, GroupWithSeparatedItems>,
  ): Either<NotAllowedError, ParsedPointGroup[]> {
    if (!pointGroupsReq || pointGroupsReq.length === 0) {
      return right([]);
    }
    const parsedGroups: ParsedPointGroup[] = [];
    for (const pointGroupReq of pointGroupsReq) {
      const groupWithItens = groupsMapById.get(pointGroupReq.groupId);
      if (!groupWithItens) {
        return left(
          new NotAllowedError(
            "Server Error: Group not found for point, this should not happen",
          ),
        );
      }
      if (groupWithItens.group.tension.value !== pointGroupReq.tensionLevel) {
        return left(
          new NotAllowedError(
            `Group tension level mismatch for group ID ${pointGroupReq.groupId}`,
          ),
        );
      }

      parsedGroups.push({
        tensionLevel: pointGroupReq.tensionLevel,
        level: pointGroupReq.level,
        ...groupWithItens,
      });
    }
    return right(parsedGroups);
  }
  parsePointUntiedMaterials(
    pointUntiedMaterialsReq:
      | { quantity: number; materialId: string }[]
      | undefined,
    materialsMapById: Map<string, Material>,
  ): Either<NotAllowedError, { quantity: number; material: Material }[]> {
    if (!pointUntiedMaterialsReq || pointUntiedMaterialsReq.length === 0) {
      return right([]);
    }
    const parsedUntiedMaterials: { quantity: number; material: Material }[] =
      [];
    for (const untiedMaterialReq of pointUntiedMaterialsReq) {
      const material = materialsMapById.get(untiedMaterialReq.materialId);
      if (!material) {
        return left(
          new NotAllowedError(
            "Server Error: Untied material not found for point, this should not happen",
          ),
        );
      }
      parsedUntiedMaterials.push({
        quantity: untiedMaterialReq.quantity,
        material,
      });
    }
    return right(parsedUntiedMaterials);
  }
}
