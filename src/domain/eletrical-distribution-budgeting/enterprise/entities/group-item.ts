import { Entity } from "src/core/entities/entity";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { Optional } from "src/core/types/optional";

export interface GroupItemBaseProps {
  groupId: UniqueEntityID;
  quantity: number;
  addByPhase: number;
  description?: string;
}

export interface GroupMaterialProps extends GroupItemBaseProps {
  type: "material";
  materialId: UniqueEntityID;
}

export interface GroupPoleScrewProps extends GroupItemBaseProps {
  type: "poleScrew";
  lengthAdd: number;
}

export interface GroupCableConnectorProps extends GroupItemBaseProps {
  type: "cableConnector";
  localCableSectionInMM: number;
  oneSideConnector?: boolean; // Para alças e laços, que consideram apenas uma espessura de cabo
}

export type GroupItemProps =
  | GroupMaterialProps
  | GroupPoleScrewProps
  | GroupCableConnectorProps;

export class GroupItem<
  T extends GroupItemProps = GroupItemProps,
> extends Entity<T> {
  static createMaterial(
    props: Optional<GroupMaterialProps, "addByPhase">,
    id?: UniqueEntityID,
  ): GroupItem<GroupMaterialProps> {
    return new GroupItem(
      {
        addByPhase: props.addByPhase || 0,
        ...props,
      } as GroupMaterialProps,
      id,
    );
  }

  static createPoleScrew(
    props: Optional<GroupPoleScrewProps, "addByPhase">,
    id?: UniqueEntityID,
  ): GroupItem<GroupPoleScrewProps> {
    return new GroupItem(
      {
        addByPhase: props.addByPhase || 0,
        ...props,
      } as GroupPoleScrewProps,
      id,
    );
  }

  static createCableConnector(
    props: Optional<GroupCableConnectorProps, "addByPhase">,
    id?: UniqueEntityID,
  ): GroupItem<GroupCableConnectorProps> {
    return new GroupItem(
      {
        addByPhase: props.addByPhase || 0,
        ...props,
      } as GroupCableConnectorProps,
      id,
    );
  }

  // Getters comuns
  get groupId(): UniqueEntityID {
    return this.props.groupId;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  set quantity(quantity: number) {
    this.props.quantity = quantity;
  }

  get addByPhase(): number {
    return this.props.addByPhase;
  }

  set addByPhase(addByPhase: number) {
    this.props.addByPhase = addByPhase;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  set description(description: string | undefined) {
    this.props.description = description;
  }

  get type(): T["type"] {
    return this.props.type;
  }

  isMaterial(): this is GroupItem<GroupMaterialProps> {
    return this.props.type === "material";
  }
  get materialId(): UniqueEntityID {
    if (this.isMaterial()) {
      return this.props.materialId;
    }
    throw new Error("This GroupItem is not of type 'material'");
  }

  isPoleScrew(): this is GroupItem<GroupPoleScrewProps> {
    return this.props.type === "poleScrew";
  }
  get lengthAdd(): number | undefined {
    if (this.isPoleScrew()) {
      return this.props.lengthAdd;
    }
  }

  isCableConnector(): this is GroupItem<GroupCableConnectorProps> {
    return this.props.type === "cableConnector";
  }
  get localCableSectionInMM(): number | undefined {
    if (this.isCableConnector()) {
      return this.props.localCableSectionInMM;
    }
  }
  get oneSideConnector(): boolean | undefined {
    if (this.isCableConnector()) {
      return this.props.oneSideConnector;
    }
  }
}
