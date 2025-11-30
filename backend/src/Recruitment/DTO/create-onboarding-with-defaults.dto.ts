import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsDateString } from 'class-validator';

export class CreateOnboardingWithDefaultsDto {
  @IsNotEmpty()
  @IsString()
  employeeId: string;

  @IsOptional()
  @IsDateString()
  startDate?: string; // Use for calculating deadlines

  @IsOptional()
  @IsBoolean()
  includeITTasks?: boolean; // Default: true

  @IsOptional()
  @IsBoolean()
  includeAdminTasks?: boolean; // Default: true

  @IsOptional()
  @IsBoolean()
  includeHRTasks?: boolean; // Default: true

  @IsOptional()
  @IsString()
  notes?: string;
}
