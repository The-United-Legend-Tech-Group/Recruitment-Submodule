import { IsDateString, IsIn, IsInt, IsMongoId, IsOptional, IsString, Min } from 'class-validator';

export class CreateJobRequisitionDto {
    @IsString()
    requisitionId: string;

    @IsMongoId()
    templateId: string;

    @IsInt()
    @Min(1)
    openings: number;

    @IsString()
    location: string;

    @IsMongoId()
    hiringManagerId: string;

    @IsIn(['draft', 'published', 'closed'])
    @IsOptional()
    publishStatus?: string;

    @IsOptional()
    @IsDateString()
    postingDate?: string;

    @IsOptional()
    @IsDateString()
    expiryDate?: string;
}
