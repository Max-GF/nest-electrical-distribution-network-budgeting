import { ApiProperty } from "@nestjs/swagger";

export class EditCableConnectorDto {
  @ApiProperty({
    description: "The code of the cable connector",
    example: 12345,
    required: false,
  })
  code?: number;

  @ApiProperty({
    description: "The description of the cable connector",
    example: "CONECTOR PERFURANTE 10-95MM",
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: "The unit of the cable connector",
    example: "UND",
    required: false,
  })
  unit?: string;

  @ApiProperty({
    description: "The IDs of the entrance cables options",
    example: ["uuid1", "uuid2"],
    required: false,
  })
  newEntranceCablesOptionsIds?: string[];

  @ApiProperty({
    description: "The IDs of the exit cables options",
    example: ["uuid3", "uuid4"],
    required: false,
  })
  newExitCablesOptionsIds?: string[];
}
