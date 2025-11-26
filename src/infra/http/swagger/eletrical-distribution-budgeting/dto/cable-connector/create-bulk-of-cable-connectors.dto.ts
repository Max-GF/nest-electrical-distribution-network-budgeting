import { ApiProperty } from "@nestjs/swagger";
import { CreateCableConnectorDto } from "./create-cable-connector.dto";

export class CreateBulkOfCableConnectorsDto {
  @ApiProperty({
    description: "The list of cable connectors to create",
    type: [CreateCableConnectorDto],
  })
  cableConnectors!: CreateCableConnectorDto[];
}
