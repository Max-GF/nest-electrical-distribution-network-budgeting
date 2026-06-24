import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

class CreateCableConnectorDto {
  @ApiProperty({ example: 12345 })
  code!: number;

  @ApiProperty({ example: "CONECTOR PERFURANTE 10-95MM" })
  description!: string;

  @ApiProperty({ example: "UND" })
  unit!: string;

  @ApiProperty({
    type: [Number],
    example: [12345, 67890],
  })
  entranceCablesOptionsCodes!: number[];

  @ApiPropertyOptional({
    type: [Number],
    example: [12345, 67890],
  })
  exitCablesOptionsCodes?: number[];
}

export class CreateBulkOfCableConnectorsDto {
  @ApiProperty({
    description: "The list of cable connectors to create",
    type: [CreateCableConnectorDto],
  })
  cableConnectors!: CreateCableConnectorDto[];
}
