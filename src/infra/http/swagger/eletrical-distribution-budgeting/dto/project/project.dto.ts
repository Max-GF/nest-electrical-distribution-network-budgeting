import { ApiProperty } from "@nestjs/swagger";

export class ProjectDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty()
  budgetAlreadyCalculated!: boolean;

  @ApiProperty({ required: false })
  lastBudgetCalculatedAt?: Date;
}
