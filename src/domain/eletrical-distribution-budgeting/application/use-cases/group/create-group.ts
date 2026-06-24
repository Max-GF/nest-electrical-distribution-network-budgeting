import { Injectable } from "@nestjs/common";
import { Either, left, right } from "src/core/either";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { AlreadyRegisteredError } from "src/core/errors/generics/already-registered-error";
import { NotAllowedError } from "src/core/errors/generics/not-allowed-error";
import { ResourceNotFoundError } from "src/core/errors/generics/resource-not-found-error";
import { Group } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/group";
import { GroupItem } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/group-item";
import { TensionLevel } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/value-objects/tension-level";
import { CablesRepository } from "../../repositories/cables-repository";
import { GroupsRepository } from "../../repositories/groups-repository";
import { MaterialsRepository } from "../../repositories/materials-repository";

export interface CreateGroupUseCaseRequest {
  name: string;
  tension: string;
  description: string;
  items: GroupItemRequest[];
}

interface BaseGroupItemRequest {
  quantity: number;
  addByPhase?: number;
  description?: string;
}

export interface GroupMaterialRequest extends BaseGroupItemRequest {
  type: "material";
  materialId: string;
}

export interface GroupPoleScrewRequest extends BaseGroupItemRequest {
  type: "poleScrew";
  lengthAdd: number;
}

export interface GroupCableConnectorRequest extends BaseGroupItemRequest {
  type: "cableConnector";
  localCableId?: string;
  oneSideConnector?: boolean;
}

type GroupItemRequest =
  | GroupMaterialRequest
  | GroupPoleScrewRequest
  | GroupCableConnectorRequest;

type CreateGroupUseCaseResponse = Either<
  AlreadyRegisteredError | NotAllowedError | ResourceNotFoundError,
  {
    group: Group;
  }
>;

@Injectable()
export class CreateGroupUseCase {
  constructor(
    private groupsRepository: GroupsRepository,
    private materialsRepository: MaterialsRepository,
    private cablesRepository: CablesRepository,
  ) {}

  async execute({
    name,
    tension,
    description,
    items,
  }: CreateGroupUseCaseRequest): Promise<CreateGroupUseCaseResponse> {
    const upperCasedTension = tension.toUpperCase();

    if (!TensionLevel.isValid(upperCasedTension)) {
      return left(
        new NotAllowedError(`Tension level "${tension}" is not allowed.`),
      );
    }

    if (items.length === 0) {
      return left(new NotAllowedError("Group must have at least one item."));
    }

    const existingGroup = await this.groupsRepository.findByName(name);

    if (existingGroup) {
      return left(
        new AlreadyRegisteredError(
          `Group name "${name}" is already registered.`,
        ),
      );
    }

    const { materials, poleScrews, cableConnectors } =
      this.classifyItems(items);

    const materialValidation = await this.validateMaterials(materials);
    if (materialValidation.isLeft()) {
      return left(materialValidation.value);
    }

    const cablesValidation = await this.validateLocalCables(cableConnectors);
    if (cablesValidation.isLeft()) {
      return left(cablesValidation.value);
    }

    const contextItemsValidation = this.validateContextItems(poleScrews);
    if (contextItemsValidation.isLeft()) {
      return left(contextItemsValidation.value);
    }

    const group = Group.create({
      name: name.toUpperCase(),
      tension: TensionLevel.create(upperCasedTension),
      description: description,
    });

    const groupItems = this.createGroupItems(
      group.id,
      materials,
      poleScrews,
      cableConnectors,
    );

    await this.groupsRepository.createGroupWithItems(group, groupItems);

    return right({
      group,
    });
  }

  private classifyItems(items: GroupItemRequest[]) {
    const materials: GroupMaterialRequest[] = [];
    const poleScrews: GroupPoleScrewRequest[] = [];
    const cableConnectors: GroupCableConnectorRequest[] = [];

    items.forEach((item) => {
      switch (item.type) {
        case "material":
          materials.push(item);
          break;
        case "poleScrew":
          poleScrews.push(item);
          break;
        case "cableConnector":
          cableConnectors.push(item);
          break;
      }
    });

    return { materials, poleScrews, cableConnectors };
  }

  private async validateMaterials(
    materials: GroupMaterialRequest[],
  ): Promise<Either<ResourceNotFoundError, undefined>> {
    if (materials.length === 0) return right(undefined);

    const materialsIds = materials.map((material) => material.materialId);
    const existingMaterials =
      await this.materialsRepository.findByIds(materialsIds);

    if (existingMaterials.length !== materialsIds.length) {
      const existingMaterialsIdsSet = new Set(
        existingMaterials.map((material) => material.id.toString()),
      );
      const missingMaterialsIds = materialsIds.filter(
        (materialId) => !existingMaterialsIdsSet.has(materialId),
      );
      return left(
        new ResourceNotFoundError(
          `Materials with missing IDs: ${missingMaterialsIds.join(", ")}`,
        ),
      );
    }

    return right(undefined);
  }

  private async validateLocalCables(
    cableConnectors: GroupCableConnectorRequest[],
  ): Promise<Either<ResourceNotFoundError, undefined>> {
    const localCablesIds = cableConnectors
      .map((connector) => connector.localCableId)
      .filter((id): id is string => id !== undefined);

    if (localCablesIds.length === 0) return right(undefined);

    const uniqueLocalCablesIds = Array.from(new Set(localCablesIds));
    const existingCables =
      await this.cablesRepository.findByIds(uniqueLocalCablesIds);

    if (existingCables.length !== uniqueLocalCablesIds.length) {
      const existingCablesIdsSet = new Set(
        existingCables.map((cable) => cable.id.toString()),
      );
      const missingCablesIds = uniqueLocalCablesIds.filter(
        (cableId) => !existingCablesIdsSet.has(cableId),
      );
      return left(
        new ResourceNotFoundError(
          `Local Cables with missing IDs: ${missingCablesIds.join(", ")}`,
        ),
      );
    }

    return right(undefined);
  }

  private validateContextItems(
    poleScrews: GroupPoleScrewRequest[],
  ): Either<NotAllowedError, undefined> {
    for (const item of poleScrews) {
      if (item.lengthAdd <= 0) {
        return left(
          new NotAllowedError(
            `Item of type "poleScrew" must have a positive value for "lengthAdd".`,
          ),
        );
      }
    }
    return right(undefined);
  }

  private createGroupItems(
    groupId: UniqueEntityID,
    materials: GroupMaterialRequest[],
    poleScrews: GroupPoleScrewRequest[],
    cableConnectors: GroupCableConnectorRequest[],
  ): GroupItem[] {
    const groupItems: GroupItem[] = [];

    materials.forEach((material) => {
      const groupItem = GroupItem.createMaterial({
        groupId,
        materialId: new UniqueEntityID(material.materialId),
        quantity: material.quantity,
        addByPhase: material.addByPhase,
        description: material.description,
        type: "material",
      });
      groupItems.push(groupItem);
    });

    poleScrews.forEach((poleScrew) => {
      const groupItem = GroupItem.createPoleScrew({
        groupId,
        lengthAdd: poleScrew.lengthAdd,
        quantity: poleScrew.quantity,
        addByPhase: poleScrew.addByPhase,
        description: poleScrew.description,
        type: "poleScrew",
      });
      groupItems.push(groupItem);
    });

    cableConnectors.forEach((cableConnector) => {
      const groupItem = GroupItem.createCableConnector({
        groupId,
        localCableId: cableConnector.localCableId
          ? new UniqueEntityID(cableConnector.localCableId)
          : undefined,
        oneSideConnector: cableConnector.oneSideConnector,
        quantity: cableConnector.quantity,
        addByPhase: cableConnector.addByPhase,
        description: cableConnector.description,
        type: "cableConnector",
      });
      groupItems.push(groupItem);
    });

    return groupItems;
  }
}
