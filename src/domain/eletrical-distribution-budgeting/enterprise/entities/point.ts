import { Entity } from "src/core/entities/entity";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";

export interface PointProps {
  name: string; // P1, P2, etc
  description?: string;
  projectId: UniqueEntityID;
  mediumTensionEntranceCableId?: UniqueEntityID;
  mediumTensionExitCableId?: UniqueEntityID;
  lowTensionEntranceCableId?: UniqueEntityID;
  lowTensionExitCableId?: UniqueEntityID;
  utilityPoleId?: UniqueEntityID;
}

export class Point extends Entity<PointProps> {
  static create(props: PointProps, id?: UniqueEntityID) {
    const point = new Point(props, id);
    return point;
  }
  get name(): string {
    return this.props.name;
  }
  get projectId(): UniqueEntityID {
    return this.props.projectId;
  }

  get description(): string | undefined {
    return this.props.description;
  }
  set description(description: string | undefined) {
    this.props.description = description;
  }

  get mediumTensionEntranceCableId(): UniqueEntityID | undefined {
    return this.props.mediumTensionEntranceCableId;
  }
  set mediumTensionEntranceCableId(cableId: UniqueEntityID | undefined) {
    this.props.mediumTensionEntranceCableId = cableId;
  }
  get mediumTensionExitCableId(): UniqueEntityID | undefined {
    return this.props.mediumTensionExitCableId;
  }
  set mediumTensionExitCableId(cableId: UniqueEntityID | undefined) {
    this.props.mediumTensionExitCableId = cableId;
  }
  get lowTensionEntranceCableId(): UniqueEntityID | undefined {
    return this.props.lowTensionEntranceCableId;
  }
  set lowTensionEntranceCableId(cableId: UniqueEntityID | undefined) {
    this.props.lowTensionEntranceCableId = cableId;
  }
  get lowTensionExitCableId(): UniqueEntityID | undefined {
    return this.props.lowTensionExitCableId;
  }
  set lowTensionExitCableId(cableId: UniqueEntityID | undefined) {
    this.props.lowTensionExitCableId = cableId;
  }
  get utilityPoleId(): UniqueEntityID | undefined {
    return this.props.utilityPoleId;
  }
  set utilityPoleId(utilityPoleId: UniqueEntityID | undefined) {
    this.props.utilityPoleId = utilityPoleId;
  }
}
