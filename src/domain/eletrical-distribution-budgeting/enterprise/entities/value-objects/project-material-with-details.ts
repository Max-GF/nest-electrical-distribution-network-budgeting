import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { ValueObject } from "src/core/entities/value-object";
import { Group } from "../group";
import { Point } from "../point";
import { Project } from "../project";

export interface ProjectMaterialWithDetailsProps {
  id: UniqueEntityID;
  project: Project;
  point?: Point; // Coloquei opcional caso exista algum material global do projeto
  itemType: string; // Muito útil pro frontend saber o que renderizar
  itemCode: number;
  itemDescription: string;
  itemUnit: string;
  quantity: number;
  groupSpecs?: {
    group: Group;
    utilityPoleLevel: number;
    tensionLevel: "LOW" | "MEDIUM";
  };
}

export class ProjectMaterialWithDetails extends ValueObject<ProjectMaterialWithDetailsProps> {
  static create(props: ProjectMaterialWithDetailsProps) {
    return new ProjectMaterialWithDetails(props);
  }

  get id() {
    return this.props.id;
  }

  get project() {
    return this.props.project;
  }

  get point() {
    return this.props.point;
  }

  get itemType() {
    return this.props.itemType;
  }

  get itemCode() {
    return this.props.itemCode;
  }

  get itemDescription() {
    return this.props.itemDescription;
  }

  get itemUnit() {
    return this.props.itemUnit;
  }

  get quantity() {
    return this.props.quantity;
  }

  get groupSpecs() {
    return this.props.groupSpecs;
  }
}
