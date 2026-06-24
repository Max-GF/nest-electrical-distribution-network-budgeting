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
import { GroupItemsRepository } from "../../repositories/group-items-repository";
import { GroupsRepository } from "../../repositories/groups-repository";
import { MaterialsRepository } from "../../repositories/materials-repository";
import {
  GroupCableConnectorRequest,
  GroupMaterialRequest,
  GroupPoleScrewRequest,
} from "./create-group";

export interface EditGroupUseCaseRequest {
  groupToEditId: string;
  name?: string;
  tension?: string;
  description?: string;
  items?: GroupItemsToEdit[];
  itemsToRemoveIds?: string[];
}

interface EditGroupMaterialRequest extends GroupMaterialRequest {
  groupItemId?: string;
}

interface EditGroupPoleScrewRequest extends GroupPoleScrewRequest {
  groupItemId?: string;
}

interface EditGroupCableConnectorRequest extends GroupCableConnectorRequest {
  groupItemId?: string;
}

type GroupItemsToEdit =
  | EditGroupMaterialRequest
  | EditGroupPoleScrewRequest
  | EditGroupCableConnectorRequest;

type EditGroupUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError | AlreadyRegisteredError,
  {
    group: Group;
  }
>;

@Injectable()
export class EditGroupUseCase {
  constructor(
    private groupsRepository: GroupsRepository,
    private groupItemsRepository: GroupItemsRepository,
    private materialsRepository: MaterialsRepository,
    private cablesRepository: CablesRepository,
  ) {}

  async execute(
    editRequest: EditGroupUseCaseRequest,
  ): Promise<EditGroupUseCaseResponse> {
    const hasToEdit = { group: false, items: false };
    let updatedItems: GroupItem[] = [];
    let newItems: GroupItem[] = [];
    const actualGroupItemsIdsSet = new Set<string>();

    if (this.noEntries(editRequest)) {
      return left(
        new NotAllowedError(
          "At least one field must be provided to edit the group.",
        ),
      );
    }

    const {
      groupToEditId,
      description,
      name,
      tension,
      items,
      itemsToRemoveIds,
    } = editRequest;

    const groupToEdit = await this.groupsRepository.findById(groupToEditId);

    if (!groupToEdit) {
      return left(
        new ResourceNotFoundError(
          `Group with ID "${groupToEditId}" was not found.`,
        ),
      );
    }

    if (name && name.toUpperCase() !== groupToEdit.name) {
      const existingGroup = await this.groupsRepository.findByName(name);
      if (existingGroup) {
        return left(
          new AlreadyRegisteredError(
            `Group name "${name}" is already registered.`,
          ),
        );
      }
      groupToEdit.name = name.toUpperCase();
      hasToEdit.group = true;
    }

    if (description && description !== groupToEdit.description) {
      groupToEdit.description = description;
      hasToEdit.group = true;
    }

    if (tension && tension.toUpperCase() !== groupToEdit.tension.value) {
      const upperCasedTension = tension.toUpperCase();
      if (!TensionLevel.isValid(upperCasedTension)) {
        return left(
          new NotAllowedError(`Tension level "${tension}" is not allowed.`),
        );
      }
      groupToEdit.tension = TensionLevel.create(upperCasedTension);
      hasToEdit.group = true;
    }

    if (items && items.length > 0) {
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

      const actualGroupItems =
        await this.groupItemsRepository.findByGroupId(groupToEditId);

      const { newGroupItems, itemsToEdit } = this.buildUpdatedGroupItems(
        groupToEdit.id,
        materials,
        poleScrews,
        cableConnectors,
      );

      actualGroupItems.forEach((item) => {
        actualGroupItemsIdsSet.add(item.id.toString());
      });

      const missingItems = itemsToEdit.filter(
        (item) => !actualGroupItemsIdsSet.has(item.id.toString()),
      );

      if (missingItems.length > 0) {
        return left(
          new NotAllowedError(
            `The following items do not belong to the given group and cannot be edited: ${missingItems
              .map((item) => item.id.toString())
              .join(", ")}.`,
          ),
        );
      }

      hasToEdit.items = true;
      newItems = newGroupItems;
      updatedItems = itemsToEdit;
    }

    let filteredRemoveIds: string[] = [];
    if (itemsToRemoveIds && itemsToRemoveIds.length > 0) {
      const editIds = new Set(
        (items ?? [])
          .map((item) => (item as { groupItemId?: string }).groupItemId)
          .filter((id): id is string => !!id),
      );

      filteredRemoveIds = itemsToRemoveIds.filter((id) => !editIds.has(id));

      if (filteredRemoveIds.length > 0) {
        if (actualGroupItemsIdsSet.size === 0) {
          const actualGroupItems =
            await this.groupItemsRepository.findByGroupId(groupToEditId);
          actualGroupItems.forEach((item) =>
            actualGroupItemsIdsSet.add(item.id.toString()),
          );
        }
        const invalidRemoveIds = filteredRemoveIds.filter(
          (id) => !actualGroupItemsIdsSet.has(id),
        );
        if (invalidRemoveIds.length > 0) {
          return left(
            new NotAllowedError(
              `The following item IDs do not belong to the given group and cannot be removed: ${invalidRemoveIds.join(", ")}.`,
            ),
          );
        }
        hasToEdit.items = true;
      }
    }

    if (!hasToEdit.group && !hasToEdit.items) {
      return left(
        new NotAllowedError(
          "At least one different value must be provided to edit the group.",
        ),
      );
    }

    await this.groupsRepository.updateGroupAndItems(
      groupToEdit,
      newItems,
      updatedItems,
      filteredRemoveIds,
    );

    return right({
      group: groupToEdit,
    });
  }

  private classifyItems(items: GroupItemsToEdit[]) {
    const materials: EditGroupMaterialRequest[] = [];
    const poleScrews: EditGroupPoleScrewRequest[] = [];
    const cableConnectors: EditGroupCableConnectorRequest[] = [];

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
    materials: EditGroupMaterialRequest[],
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
        (materialId) => !existingMaterialsIdsSet.has(materialId.toString()),
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
    cableConnectors: EditGroupCableConnectorRequest[],
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
    poleScrews: EditGroupPoleScrewRequest[],
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

  private buildUpdatedGroupItems(
    groupId: UniqueEntityID,
    materials: EditGroupMaterialRequest[],
    poleScrews: EditGroupPoleScrewRequest[],
    cableConnectors: EditGroupCableConnectorRequest[],
  ): {
    newGroupItems: GroupItem[];
    itemsToEdit: GroupItem[];
  } {
    const newGroupItems: GroupItem[] = [];
    const itemsToEdit: GroupItem[] = [];

    materials.forEach((material) => {
      const groupItem = GroupItem.createMaterial(
        {
          groupId,
          materialId: new UniqueEntityID(material.materialId),
          quantity: material.quantity,
          addByPhase: material.addByPhase,
          description: material.description,
          type: "material",
        },
        material.groupItemId
          ? new UniqueEntityID(material.groupItemId)
          : undefined,
      );
      if (material.groupItemId) {
        itemsToEdit.push(groupItem);
      } else {
        newGroupItems.push(groupItem);
      }
    });

    poleScrews.forEach((poleScrew) => {
      const groupItem = GroupItem.createPoleScrew(
        {
          groupId,
          lengthAdd: poleScrew.lengthAdd,
          quantity: poleScrew.quantity,
          addByPhase: poleScrew.addByPhase,
          description: poleScrew.description,
          type: "poleScrew",
        },
        poleScrew.groupItemId
          ? new UniqueEntityID(poleScrew.groupItemId)
          : undefined,
      );
      if (poleScrew.groupItemId) {
        itemsToEdit.push(groupItem);
      } else {
        newGroupItems.push(groupItem);
      }
    });

    cableConnectors.forEach((cableConnector) => {
      const groupItem = GroupItem.createCableConnector(
        {
          groupId,
          localCableId: cableConnector.localCableId
            ? new UniqueEntityID(cableConnector.localCableId)
            : undefined,
          oneSideConnector: cableConnector.oneSideConnector,
          quantity: cableConnector.quantity,
          addByPhase: cableConnector.addByPhase,
          description: cableConnector.description,
          type: "cableConnector",
        },
        cableConnector.groupItemId
          ? new UniqueEntityID(cableConnector.groupItemId)
          : undefined,
      );
      if (cableConnector.groupItemId) {
        itemsToEdit.push(groupItem);
      } else {
        newGroupItems.push(groupItem);
      }
    });

    return { newGroupItems, itemsToEdit };
  }

  noEntries(editGroupUseCaseRequest: EditGroupUseCaseRequest): boolean {
    return Object.entries(editGroupUseCaseRequest).every(
      ([key, value]) => value === undefined || key === "groupToEditId",
    );
  }
}
