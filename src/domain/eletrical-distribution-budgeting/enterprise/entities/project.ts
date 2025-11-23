import { Entity } from "src/core/entities/entity";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { Optional } from "src/core/types/optional";

export interface ProjectProps {
  name: string;
  description: string;
  budgetAlreadyCalculated: boolean;
  lastBudgetCalculatedAt?: Date;
}

export class Project extends Entity<ProjectProps> {
  static create(
    props: Optional<ProjectProps, "budgetAlreadyCalculated">,
    id?: UniqueEntityID,
  ) {
    const project = new Project(
      {
        budgetAlreadyCalculated: props.budgetAlreadyCalculated ?? false,
        ...props,
      },
      id,
    );
    return project;
  }
  get name(): string {
    return this.props.name;
  }
  set name(name: string) {
    this.props.name = name;
  }
  get description(): string {
    return this.props.description;
  }
  set description(description: string) {
    this.props.description = description;
  }
  get budgetAlreadyCalculated(): boolean {
    return this.props.budgetAlreadyCalculated;
  }
  set budgetAlreadyCalculated(budgetAlreadyCalculated: boolean) {
    this.props.budgetAlreadyCalculated = budgetAlreadyCalculated;
    this.props.lastBudgetCalculatedAt = budgetAlreadyCalculated
      ? new Date()
      : undefined;
  }
  get lastBudgetCalculatedAt(): Date | undefined {
    return this.props.lastBudgetCalculatedAt;
  }
}
