import { ApiProperty } from "@nestjs/swagger";
import { CreateUtilityPoleDto } from "./create-utility-pole.dto";

export class CreateBulkOfUtilityPolesDto {
  @ApiProperty({
    description: "The list of utility poles to create",
    type: [CreateUtilityPoleDto],
  })
  utilityPoles!: CreateUtilityPoleDto[];
}
