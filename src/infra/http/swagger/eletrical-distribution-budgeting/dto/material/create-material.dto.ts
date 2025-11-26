import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateMaterialDto {
  @ApiProperty({
    description: "The code of the material",
    example: 12345,
  })
  @IsNumber()
  @IsNotEmpty()
  code!: number;

  @ApiProperty({
    description: "The description of the material",
    example: "Material Description",
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({
    description: "The unit of the material",
    example: "UN",
  })
  @IsString()
  @IsNotEmpty()
  unit!: string;

  @ApiProperty({
    description: "The tension of the material",
    example: "MT",
  })
  @IsString()
  @IsNotEmpty()
  tension!: string;
}
