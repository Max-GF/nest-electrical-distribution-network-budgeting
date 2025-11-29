import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { ValueObject } from "src/core/entities/value-object";
import { Optional } from "src/core/types/optional";
import {
  GroupCableConnectorProps,
  GroupMaterialProps,
  GroupPoleScrewProps,
} from "../group-item";
import { Material } from "../material";

export interface GroupMaterialWithDetailsProps
  extends Omit<GroupMaterialProps, "materialId"> {
  material: Material;
  groupItemId: UniqueEntityID;
}
export interface GroupPoleScrewWithDetailsProps extends GroupPoleScrewProps {
  groupItemId: UniqueEntityID;
}

export interface GroupCableConnectorWithDetailsProps
  extends GroupCableConnectorProps {
  groupItemId: UniqueEntityID;
}

export type GroupItemWithDetailsProps =
  | GroupMaterialWithDetailsProps
  | GroupPoleScrewWithDetailsProps
  | GroupCableConnectorWithDetailsProps;

export class GroupItemWithDetails<
  T extends GroupItemWithDetailsProps = GroupItemWithDetailsProps,
> extends ValueObject<T> {
  static createMaterial(
    props: Optional<GroupMaterialWithDetailsProps, "addByPhase">,
  ): GroupItemWithDetails<GroupMaterialWithDetailsProps> {
    return new GroupItemWithDetails({
      addByPhase: props.addByPhase || 0,
      ...props,
    } as GroupMaterialWithDetailsProps);
  }
  static createPoleScrew(
    props: Optional<GroupPoleScrewWithDetailsProps, "addByPhase">,
  ): GroupItemWithDetails<GroupPoleScrewWithDetailsProps> {
    return new GroupItemWithDetails({
      addByPhase: props.addByPhase || 0,
      ...props,
    } as GroupPoleScrewWithDetailsProps);
  }
  static createCableConnector(
    props: Optional<GroupCableConnectorWithDetailsProps, "addByPhase">,
  ): GroupItemWithDetails<GroupCableConnectorWithDetailsProps> {
    return new GroupItemWithDetails({
      addByPhase: props.addByPhase || 0,
      ...props,
    } as GroupCableConnectorWithDetailsProps);
  }

  get groupId(): UniqueEntityID {
    return this.props.groupId;
  }

  get groupItemId(): UniqueEntityID {
    return this.props.groupItemId;
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

  get type(): string {
    return this.props.type;
  }

  isMaterial(): this is GroupItemWithDetails<GroupMaterialWithDetailsProps> {
    return this.props.type === "material";
  }
  get material(): Material {
    if (this.isMaterial()) {
      return this.props.material;
    }
    throw new Error("This GroupItemWithDetails is not of type 'material'");
  }

  isPoleScrew(): this is GroupItemWithDetails<GroupPoleScrewWithDetailsProps> {
    return this.props.type === "poleScrew";
  }

  get lengthAdd(): number {
    if (this.isPoleScrew()) {
      return this.props.lengthAdd;
    }
    throw new Error("This GroupItemWithDetails is not of type 'poleScrew'");
  }

  isCableConnector(): this is GroupItemWithDetails<GroupCableConnectorWithDetailsProps> {
    return this.props.type === "cableConnector";
  }

  get localCableSectionInMM(): number {
    if (this.isCableConnector()) {
      return this.props.localCableSectionInMM;
    }
    throw new Error(
      "This GroupItemWithDetails is not of type 'cableConnector'",
    );
  }

  get oneSideConnector(): boolean | undefined {
    if (this.isCableConnector()) {
      return this.props.oneSideConnector;
    }
    throw new Error(
      "This GroupItemWithDetails is not of type 'cableConnector'",
    );
  }
}
