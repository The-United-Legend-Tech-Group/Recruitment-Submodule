import { IsDateString, IsIn, IsInt, IsMongoId, IsOptional, IsString, Min } from 'class-validator';

export class UpdateJobRequisitionDto {
    @IsOptional()
    @IsMongoId()
    templateId: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    openings: number;

    @IsOptional()
    @IsString()
    location: string;

    @IsOptional()
    @IsIn(['draft', 'published', 'closed'])
    publishStatus: string;

    @IsOptional()
    @IsDateString()
    postingDate?: string;

    @IsOptional()
    @IsDateString()
    expiryDate?: string;
}
