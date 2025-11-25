import { IsOptional, IsString } from 'class-validator';

export class CreateProfileChangeRequestDto {
  @IsString()
  requestDescription: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
