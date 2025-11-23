import { Injectable } from "@nestjs/common";
import { Either, left, right } from "src/core/either";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { AlreadyRegisteredError } from "src/core/errors/generics/already-registered-error";
import { NotAllowedError } from "src/core/errors/generics/not-allowed-error";
import { Group } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/group";
import { GroupItem } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/group-item";
import { TensionLevel } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/value-objects/tension-level";
import { GroupsRepository } from "../../repositories/groups-repository";
import { MaterialsRepository } from "../../repositories/materials-repository";

export interface CreateGroupUseCaseRequest {
  name: string;
  tension: string;
  description: string;
  items: GroupItemRequest[];
}

// Interfaces específicas para cada tipo de item vindo do frontend
interface BaseGroupItemRequest {
  quantity: number;
  addByPhase?: number;
  description?: string;
}

export interface GroupMaterialRequest extends BaseGroupItemRequest {
  type: "material";
  materialId: string; // Vem como string do frontend
}

export interface GroupPoleScrewRequest extends BaseGroupItemRequest {
  type: "poleScrew";
  lengthAdd: number;
}

export interface GroupCableConnectorRequest extends BaseGroupItemRequest {
  type: "cableConnector";
  localCableSectionInMM: number;
}

// Tipo união para todos os possíveis itens
type GroupItemRequest =
  | GroupMaterialRequest
  | GroupPoleScrewRequest
  | GroupCableConnectorRequest;

type CreateGroupUseCaseResponse = Either<
  AlreadyRegisteredError | NotAllowedError,
  {
    group: Group;
  }
>;

@Injectable()
export class CreateGroupUseCase {
  constructor(
    private groupsRepository: GroupsRepository,
    private materialsRepository: MaterialsRepository,
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

    // Validar materials existem
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

    // Criar o grupo
    const group = Group.create({
      name: name.toUpperCase(),
      tension: TensionLevel.create(upperCasedTension),
      description: description.toLowerCase(),
    });

    // Criar os GroupItems
    const groupItems = this.createGroupItems(
      group.id,
      materials,
      poleScrews,
      cableConnectors,
    );

    // Salvar no repositório (assumindo que seu repository tem método createWithItems)
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

  private createGroupItems(
    groupId: UniqueEntityID,
    materials: GroupMaterialRequest[],
    poleScrews: GroupPoleScrewRequest[],
    cableConnectors: GroupCableConnectorRequest[],
  ): GroupItem[] {
    const groupItems: GroupItem[] = [];

    // Criar GroupItems para materials
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

    // Criar GroupItems para pole screws
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

    // Criar GroupItems para cable connectors
    cableConnectors.forEach((cableConnector) => {
      const groupItem = GroupItem.createCableConnector({
        groupId,
        localCableSectionInMM: cableConnector.localCableSectionInMM,
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
