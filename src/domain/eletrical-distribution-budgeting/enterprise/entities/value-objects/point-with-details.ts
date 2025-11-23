import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { ValueObject } from "src/core/entities/value-object";
import { Cable } from "../cable";
import { Project } from "../project";
import { UtilityPole } from "../utility-pole";

export interface PointWithDetailsProps {
  id: UniqueEntityID;
  name: string; // P1, P2, etc
  description?: string;
  project: Project;
  mediumTensionEntranceCable?: Cable;
  mediumTensionExitCable?: Cable;
  lowTensionEntranceCable?: Cable;
  lowTensionExitCable?: Cable;
  utilityPole?: UtilityPole;
}

export class PointWithDetails extends ValueObject<PointWithDetailsProps> {
  static create(props: PointWithDetailsProps): PointWithDetails {
    return new PointWithDetails({
      ...props,
    });
  }
  get id(): UniqueEntityID {
    return this.props.id;
  }
  get name(): string {
    return this.props.name;
  }
  get description(): string | undefined {
    return this.props.description;
  }
  get project(): Project {
    return this.props.project;
  }
  get mediumTensionEntranceCable(): Cable | undefined {
    return this.props.mediumTensionEntranceCable;
  }
  get mediumTensionExitCable(): Cable | undefined {
    return this.props.mediumTensionExitCable;
  }
  get lowTensionEntranceCable(): Cable | undefined {
    return this.props.lowTensionEntranceCable;
  }
  get lowTensionExitCable(): Cable | undefined {
    return this.props.lowTensionExitCable;
  }
  get utilityPole(): UtilityPole | undefined {
    return this.props.utilityPole;
  }
}
