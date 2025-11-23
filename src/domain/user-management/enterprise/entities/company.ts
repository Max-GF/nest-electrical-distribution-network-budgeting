import { Entity } from "src/core/entities/entity";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { Cnpj } from "./value-objects/cnpj";

export interface CompanyProps {
  name: string;
  cnpj: Cnpj;
}

export class Company extends Entity<CompanyProps> {
  static create(props: CompanyProps, id?: UniqueEntityID) {
    const company = new Company(props, id);
    return company;
  }

  get name(): string {
    return this.props.name;
  }
  set name(name: string) {
    this.props.name = name;
  }
  get cnpj(): Cnpj {
    return this.props.cnpj;
  }
  set cnpj(cnpj: Cnpj) {
    this.props.cnpj = cnpj;
  }
}
