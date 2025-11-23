import { ValueObject } from "src/core/entities/value-object";
import { Base } from "../base";

export interface CompanyWithBasesProps {
  id: string;
  name: string;
  cnpj: string;
  bases: Base[];
}
export class CompanyWithBases extends ValueObject<CompanyWithBasesProps> {
  static create(props: CompanyWithBasesProps): CompanyWithBases {
    return new CompanyWithBases(props);
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get cnpj(): string {
    return this.props.cnpj;
  }
  get bases(): Base[] {
    return this.props.bases;
  }
}
