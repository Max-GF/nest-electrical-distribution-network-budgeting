import { ApiProperty } from "@nestjs/swagger";
import { CreatePoleScrewDto } from "./create-pole-screw.dto";

export class CreateBulkOfPoleScrewsDto {
  @ApiProperty({
    description: "The list of pole screws to create",
    type: [CreatePoleScrewDto],
  })
  poleScrews!: CreatePoleScrewDto[];
}
