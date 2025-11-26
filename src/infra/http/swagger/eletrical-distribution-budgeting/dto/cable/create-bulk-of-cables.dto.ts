import { ApiProperty } from "@nestjs/swagger";
import { CreateCableDto } from "./create-cable.dto";

export class CreateBulkOfCablesDto {
  @ApiProperty({
    description: "The list of cables to create",
    type: [CreateCableDto],
  })
  cables!: CreateCableDto[];
}
