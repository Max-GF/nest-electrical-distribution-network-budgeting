import { Entity } from "src/core/entities/entity";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";

export interface CableConnectorProps {
  code: number;
  description: string;
  unit: string;

  entranceCablesOptionsIds: UniqueEntityID[];
  // Optional because some connectors only serves
  // to hold one cable, not to connect two cables,
  // like the ones used in the end of a cable.
  exitCablesOptionsIds?: UniqueEntityID[];
}

export class CableConnector extends Entity<CableConnectorProps> {
  static create(props: CableConnectorProps, id?: UniqueEntityID) {
    const cable = new CableConnector(props, id);
    return cable;
  }
  get code(): number {
    return this.props.code;
  }
  get description(): string {
    return this.props.description;
  }
  set description(description: string) {
    this.props.description = description;
  }
  get unit(): string {
    return this.props.unit;
  }
  set unit(unit: string) {
    this.props.unit = unit;
  }
  get entranceCablesOptionsIds(): UniqueEntityID[] {
    return this.props.entranceCablesOptionsIds;
  }
  get exitCablesOptionsIds(): UniqueEntityID[] | undefined {
    return this.props.exitCablesOptionsIds;
  }

  updateEntranceCable(optionIds: UniqueEntityID[]): {
    added: UniqueEntityID[];
    removed: UniqueEntityID[];
  } {
    const actualIds = new Set(
      this.props.entranceCablesOptionsIds.map((id) => id.toString()),
    );
    const newIds = new Set(optionIds.map((id) => id.toString()));

    const added = optionIds.filter((id) => !actualIds.has(id.toString()));
    const removed = this.props.entranceCablesOptionsIds.filter(
      (id) => !newIds.has(id.toString()),
    );

    this.props.entranceCablesOptionsIds = optionIds;

    return { added, removed };
  }

  updateExitCable(optionIds: UniqueEntityID[]): {
    added: UniqueEntityID[];
    removed: UniqueEntityID[];
  } {
    if (!this.props.exitCablesOptionsIds) {
      this.props.exitCablesOptionsIds = [];
    }
    const actualIds = new Set(
      this.props.exitCablesOptionsIds.map((id) => id.toString()),
    );
    const newIds = new Set(optionIds.map((id) => id.toString()));

    const added = optionIds.filter((id) => !actualIds.has(id.toString()));
    const removed = this.props.exitCablesOptionsIds.filter(
      (id) => !newIds.has(id.toString()),
    );

    this.props.exitCablesOptionsIds = optionIds;

    return { added, removed };
  }
}
