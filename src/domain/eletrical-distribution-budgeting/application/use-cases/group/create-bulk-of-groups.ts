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

export interface CreateBulkOfGroupUseCaseRequest {
  groups: {
    name: string;
    tension: string;
    description: string;
    items: GroupItemRequest[];
  }[];
}

// Interfaces específicas para cada tipo de item (mantidas do caso de uso original)
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
  localCableSectionInMM: number;
}

type GroupItemRequest =
  | GroupMaterialRequest
  | GroupPoleScrewRequest
  | GroupCableConnectorRequest;

type CreateBulkOfGroupUseCaseResponse = Either<
  AlreadyRegisteredError | NotAllowedError,
  {
    groups: Group[];
  }
>;

@Injectable()
export class CreateBulkOfGroupUseCase {
  constructor(
    private groupsRepository: GroupsRepository,
    private materialsRepository: MaterialsRepository,
  ) {}

  async execute({
    groups,
  }: CreateBulkOfGroupUseCaseRequest): Promise<CreateBulkOfGroupUseCaseResponse> {
    // Validação inicial
    if (groups.length === 0) {
      return left(new NotAllowedError("Must provide at least one group."));
    }

    // Validar tensões e nomes únicos no payload
    const validationError = await this.validateGroups(groups);
    if (validationError) {
      return left(validationError);
    }

    // Classificar e validar todos os items
    const itemsValidation = await this.validateAllItems(groups);
    if (itemsValidation.isLeft()) {
      return left(itemsValidation.value);
    }

    // Criar grupos e items
    const groupsWithItems = await this.createGroupsWithItems(groups);

    // Salvar no repositório
    await this.groupsRepository.createBulkGroupsWithItems(groupsWithItems);

    return right({
      groups: groupsWithItems.map(({ group }) => group),
    });
  }

  private async validateGroups(
    groups: CreateBulkOfGroupUseCaseRequest["groups"],
  ): Promise<AlreadyRegisteredError | NotAllowedError | null> {
    const names = new Set<string>();
    const existingGroups = await this.groupsRepository.findByNames(
      groups.map((g) => g.name.toUpperCase()),
    );

    const existingNamesSet = new Set(
      existingGroups.map((group) => group.name.toUpperCase()),
    );

    for (const group of groups) {
      // Validar tensão
      const upperCasedTension = group.tension.toUpperCase();
      if (!TensionLevel.isValid(upperCasedTension)) {
        return new NotAllowedError(
          `Tension level "${group.tension}" is not allowed.`,
        );
      }

      // Validar items
      if (group.items.length === 0) {
        return new NotAllowedError(
          `Group "${group.name}" must have at least one item.`,
        );
      }

      // Validar nomes duplicados no payload
      const upperCaseName = group.name.toUpperCase();
      if (names.has(upperCaseName)) {
        return new AlreadyRegisteredError(
          `Group name "${group.name}" is duplicated in the request.`,
        );
      }
      names.add(upperCaseName);

      // Validar nomes existentes no banco
      if (existingNamesSet.has(upperCaseName)) {
        return new AlreadyRegisteredError(
          `Group name "${group.name}" is already registered.`,
        );
      }
    }

    return null;
  }

  private async validateAllItems(
    groups: CreateBulkOfGroupUseCaseRequest["groups"],
  ): Promise<Either<NotAllowedError, undefined>> {
    // Coletar todos os materiais de todos os grupos
    const allMaterials = groups.flatMap((group) =>
      group.items
        .filter((item) => item.type === "material")
        .map((item) => item.materialId),
    );

    if (allMaterials.length > 0) {
      const existingMaterials =
        await this.materialsRepository.findByIds(allMaterials);

      if (existingMaterials.length !== allMaterials.length) {
        const existingMaterialsIdsSet = new Set(
          existingMaterials.map((material) => material.id.toString()),
        );
        const missingMaterialsIds = allMaterials.filter(
          (materialId) => !existingMaterialsIdsSet.has(materialId),
        );
        return left(
          new NotAllowedError(
            `Materials with missing IDs: ${missingMaterialsIds.join(", ")}`,
          ),
        );
      }
    }

    // Validar items de contexto
    const allContextItems = groups.flatMap((group) =>
      group.items.filter(
        (item): item is GroupPoleScrewRequest | GroupCableConnectorRequest =>
          item.type === "poleScrew" || item.type === "cableConnector",
      ),
    );

    for (const item of allContextItems) {
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

  private async createGroupsWithItems(
    groups: CreateBulkOfGroupUseCaseRequest["groups"],
  ): Promise<{ group: Group; items: GroupItem[] }[]> {
    const result: { group: Group; items: GroupItem[] }[] = [];

    for (const groupData of groups) {
      const group = Group.create({
        name: groupData.name.toUpperCase(),
        tension: TensionLevel.create(
          groupData.tension.toUpperCase() as TensionLevel["value"],
        ),
        description: groupData.description.toLowerCase(),
      });

      const { materials, poleScrews, cableConnectors } = this.classifyItems(
        groupData.items,
      );

      const groupItems = this.createGroupItems(
        group.id,
        materials,
        poleScrews,
        cableConnectors,
      );

      result.push({ group, items: groupItems });
    }

    return result;
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
