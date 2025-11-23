import { Entity } from "src/core/entities/entity";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";

export interface ProjectMaterialProps {
  projectId: UniqueEntityID;
  itemId: UniqueEntityID;
  itemType:
    | "material"
    | "poleScrew"
    | "cableConnector"
    | "utilityPole"
    | "cable";
  quantity: number;

  pointId?: UniqueEntityID; // if not provided, it's considered a untied item

  groupSpecs?: {
    groupId: UniqueEntityID;
    utilityPoleLevel: number;
    tensionLevel: "LOW" | "MEDIUM";
  };
}

export class ProjectMaterial extends Entity<ProjectMaterialProps> {
  static create(props: ProjectMaterialProps, id?: UniqueEntityID) {
    const projectMaterial = new ProjectMaterial(props, id);
    return projectMaterial;
  }

  get projectId(): UniqueEntityID {
    return this.props.projectId;
  }

  get itemId(): UniqueEntityID {
    return this.props.itemId;
  }

  get itemType():
    | "material"
    | "poleScrew"
    | "cableConnector"
    | "utilityPole"
    | "cable" {
    return this.props.itemType;
  }

  get quantity(): number {
    return this.props.quantity;
  }
  set quantity(quantity: number) {
    this.props.quantity = quantity;
  }

  get pointId(): UniqueEntityID | undefined {
    return this.props.pointId;
  }
  set pointId(pointId: UniqueEntityID | undefined) {
    this.props.pointId = pointId;
  }

  get groupSpecs():
    | { groupId: UniqueEntityID; utilityPoleLevel: number }
    | undefined {
    return this.props.groupSpecs;
  }
  set groupSpecs(
    groupSpecs:
      | {
          groupId: UniqueEntityID;
          utilityPoleLevel: number;
          tensionLevel: "LOW" | "MEDIUM";
        }
      | undefined,
  ) {
    this.props.groupSpecs = groupSpecs;
  }
}
