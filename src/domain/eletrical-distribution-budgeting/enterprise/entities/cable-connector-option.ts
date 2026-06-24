import { Entity } from "src/core/entities/entity";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";

export interface CableConnectorOptionsProps {
  cableConnectorId: UniqueEntityID;
  cableId: UniqueEntityID;
  type: "entrance" | "exit";
}

export class CableConnectorOptions extends Entity<CableConnectorOptionsProps> {
  static create(props: CableConnectorOptionsProps, id?: UniqueEntityID) {
    const cable = new CableConnectorOptions(props, id);
    return cable;
  }
  get cableConnectorId(): UniqueEntityID {
    return this.props.cableConnectorId;
  }
  get cableId(): UniqueEntityID {
    return this.props.cableId;
  }
  get type(): "entrance" | "exit" {
    return this.props.type;
  }
  set type(type: "entrance" | "exit") {
    this.props.type = type;
  }
}
