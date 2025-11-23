import { Injectable } from "@nestjs/common";
import { Either, left, right } from "src/core/either";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { AlreadyRegisteredError } from "src/core/errors/generics/already-registered-error";
import { NotAllowedError } from "src/core/errors/generics/not-allowed-error";
import { ResourceNotFoundError } from "src/core/errors/generics/resource-not-found-error";
import { Group } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/group";
import { GroupItem } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/group-item";
import { TensionLevel } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/value-objects/tension-level";
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
  ResourceNotFoundError | NotAllowedError,
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
  ) {}

  async execute(
    editRequest: EditGroupUseCaseRequest,
  ): Promise<EditGroupUseCaseResponse> {
    const hasToEdit = { group: false, items: false };
    let updatedItems: GroupItem[] = [];
    let newItems: GroupItem[] = [];
    if (this.noEntries(editRequest)) {
      return left(
        new NotAllowedError(
          "At least one field must be provided to edit the group.",
        ),
      );
    }
    const { groupToEditId, description, name, tension, items } = editRequest;

    const groupToEdit = await this.groupsRepository.findById(groupToEditId);
    if (!groupToEdit) {
      return left(
        new ResourceNotFoundError(
          `Group with ID "${groupToEditId}" was not found.`,
        ),
      );
    }
    if (name && name !== groupToEdit.name) {
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
      groupToEdit.description = description.toLowerCase();
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
      hasToEdit.items = true;
      const { materials, poleScrews, cableConnectors } =
        this.classifyItems(items);

      const materialValidation = await this.validateMaterials(materials);
      if (materialValidation.isLeft()) {
        return left(materialValidation.value);
      }
      const contextItemsValidation = this.validateContextItems([
        ...poleScrews,
        ...cableConnectors,
      ]);
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
      const actualGroupItemsIdsSet = new Set(
        actualGroupItems.map((item) => item.id.toString()),
      );
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
    );

    return right({
      group: groupToEdit,
    });
  }

  private classifyItems(items: GroupItemsToEdit[]) {
    const materials: (GroupMaterialRequest & { groupItemId?: string })[] = [];
    const poleScrews: (GroupPoleScrewRequest & { groupItemId?: string })[] = [];
    const cableConnectors: (GroupCableConnectorRequest & {
      groupItemId?: string;
    })[] = [];

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
  ): Promise<Either<NotAllowedError, undefined>> {
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
        new NotAllowedError(
          `Materials with missing IDs: ${missingMaterialsIds.join(", ")}`,
        ),
      );
    }

    return right(undefined);
  }
  private validateContextItems(
    items: (GroupPoleScrewRequest | GroupCableConnectorRequest)[],
  ): Either<NotAllowedError, undefined> {
    if (items.length === 0) return right(undefined);

    for (const item of items) {
      const itemKeyCheck =
        item.type === "poleScrew" ? "lengthAdd" : "localCableSectionInMM";
      if (item[itemKeyCheck] <= 0) {
        return left(
          new NotAllowedError(
            `Item of type "${item.type}" must have a positive value for "${itemKeyCheck}".`,
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

    // Criar GroupItems para materials
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
        new UniqueEntityID(material.groupItemId),
      );
      if (material.groupItemId) {
        itemsToEdit.push(groupItem);
      } else {
        newGroupItems.push(groupItem);
      }
    });

    // Criar GroupItems para pole screws
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
        new UniqueEntityID(poleScrew.groupItemId),
      );
      if (poleScrew.groupItemId) {
        itemsToEdit.push(groupItem);
      } else {
        newGroupItems.push(groupItem);
      }
    });

    // Criar GroupItems para cable connectors
    cableConnectors.forEach((cableConnector) => {
      const groupItem = GroupItem.createCableConnector(
        {
          groupId,
          localCableSectionInMM: cableConnector.localCableSectionInMM,
          quantity: cableConnector.quantity,
          addByPhase: cableConnector.addByPhase,
          description: cableConnector.description,
          type: "cableConnector",
        },
        new UniqueEntityID(cableConnector.groupItemId),
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
