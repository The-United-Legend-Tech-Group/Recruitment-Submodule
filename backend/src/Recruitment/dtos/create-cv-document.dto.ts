import { IsArray, IsOptional, IsString, IsEnum, IsDateString, IsMongoId } from 'class-validator';
import { DocumentType } from '../enums/document-type.enum';

export class CreateCVDocumentDto {
  @IsMongoId()
  ownerId: string;

  @IsEnum(DocumentType)
  type: DocumentType;

  @IsString()
  filePath: string;

  @IsOptional()
  @IsDateString()
  uploadedAt?: Date;

  // NO ownerID - this comes from auth context
}