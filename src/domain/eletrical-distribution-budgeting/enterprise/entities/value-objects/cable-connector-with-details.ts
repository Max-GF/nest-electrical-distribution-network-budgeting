import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { ValueObject } from "src/core/entities/value-object";
import { Cable } from "../cable";

export interface CableConnectorWithDetailsProps {
  id: UniqueEntityID;
  code: number;
  description: string;
  unit: string;

  entranceCablesOptions: Cable[];
  // Optional because some connectors only serves
  // to hold one cable, not to connect two cables,
  // like the ones used in the end of a cable.
  exitCablesOptions?: Cable[];
}
export class CableConnectorWithDetails extends ValueObject<CableConnectorWithDetailsProps> {
  static create(
    props: CableConnectorWithDetailsProps,
  ): CableConnectorWithDetails {
    return new CableConnectorWithDetails(props);
  }
  get id(): UniqueEntityID {
    return this.props.id;
  }
  get code(): number {
    return this.props.code;
  }
  get description(): string {
    return this.props.description;
  }
  get unit(): string {
    return this.props.unit;
  }
  get entranceCablesOptions(): Cable[] {
    return this.props.entranceCablesOptions;
  }
  get exitCablesOptions(): Cable[] | undefined {
    return this.props.exitCablesOptions;
  }
}
