import { IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';
import { ApplicationStage } from '../enums/application-stage.enum';
import { ApplicationStatus } from '../enums/application-status.enum';

export class CreateApplicationDto {
    @IsMongoId()
    candidateId: string;

    @IsString()
    requisitionId: string;

    @IsOptional()
    @IsMongoId()
    assignedHr?: string;
}
