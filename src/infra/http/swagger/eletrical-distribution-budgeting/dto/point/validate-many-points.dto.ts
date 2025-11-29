import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from "class-validator";

class CableRequest {
  @ApiProperty({ example: true })
  @IsBoolean()
  isNew!: boolean;

  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  @IsUUID()
  cableId!: string;
}

class LowTensionCablesRequest {
  @ApiProperty({ type: CableRequest })
  @ValidateNested()
  @Type(() => CableRequest)
  entranceCable!: CableRequest;

  @ApiProperty({ type: CableRequest, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => CableRequest)
  exitCable?: CableRequest;
}

class MediumTensionCablesRequest {
  @ApiProperty({ type: CableRequest })
  @ValidateNested()
  @Type(() => CableRequest)
  entranceCable!: CableRequest;

  @ApiProperty({ type: CableRequest, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => CableRequest)
  exitCable?: CableRequest;
}

class PointCablesRequest {
  @ApiProperty({ type: LowTensionCablesRequest, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => LowTensionCablesRequest)
  lowTensionCables?: LowTensionCablesRequest;

  @ApiProperty({ type: MediumTensionCablesRequest, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => MediumTensionCablesRequest)
  mediumTensionCables?: MediumTensionCablesRequest;
}

class PointUtilityPoleRequest {
  @ApiProperty({ example: true })
  @IsBoolean()
  isNew!: boolean;

  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  @IsUUID()
  utilityPoleId!: string;
}

class PointGroupRequest {
  @ApiProperty({ example: "LOW", enum: ["LOW", "MEDIUM"] })
  @IsEnum(["LOW", "MEDIUM"])
  tensionLevel!: "LOW" | "MEDIUM";

  @ApiProperty({ example: 1 })
  @IsNumber()
  level!: number;

  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  @IsUUID()
  groupId!: string;
}

class UntiedMaterialRequest {
  @ApiProperty({ example: 5 })
  @IsNumber()
  quantity!: number;

  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  @IsUUID()
  materialId!: string;
}

export class PointToValidateRequestDto {
  @ApiProperty({ example: "P1" })
  @IsString()
  name!: string;

  @ApiProperty({ example: "Description", required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: PointUtilityPoleRequest })
  @ValidateNested()
  @Type(() => PointUtilityPoleRequest)
  pointUtilityPole!: PointUtilityPoleRequest;

  @ApiProperty({ type: PointCablesRequest })
  @ValidateNested()
  @Type(() => PointCablesRequest)
  pointCables!: PointCablesRequest;

  @ApiProperty({ type: [PointGroupRequest], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PointGroupRequest)
  pointGroups?: PointGroupRequest[];

  @ApiProperty({ type: [UntiedMaterialRequest], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UntiedMaterialRequest)
  untiedMaterials?: UntiedMaterialRequest[];
}

export class ValidateManyPointsDto {
  @ApiProperty({ type: [PointToValidateRequestDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PointToValidateRequestDto)
  points!: PointToValidateRequestDto[];
}
