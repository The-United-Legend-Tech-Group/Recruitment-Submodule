import { IsEnum, IsMongoId, IsOptional } from 'class-validator';
import { ApplicationStage } from '../enums/application-stage.enum';
import { ApplicationStatus } from '../enums/application-status.enum';

export class UpdateApplicationDto {
  @IsOptional()
  @IsEnum(ApplicationStage)
  currentStage?: ApplicationStage;

  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @IsOptional()
  @IsMongoId()
  assignedHr?: string;
}