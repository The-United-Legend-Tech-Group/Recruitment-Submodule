import { IsArray, IsDate, IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { InterviewMethod } from '../enums/interview-method.enum';




export class UpdateInterviewDto {
  @ApiProperty({ description: 'Scheduled date and time for the interview' })
  @IsDate()
  @Type(() => Date)
  scheduledDate: Date;

  @ApiProperty({ enum: InterviewMethod, description: 'Method of interview (onsite, video, phone)' })
  @IsEnum(InterviewMethod)
  method: InterviewMethod;

  @ApiProperty({ type: [String], description: 'Array of interviewer/panel member ObjectIds' })
  @IsArray()
  @IsMongoId({ each: true })
  panel: string[];

  @ApiPropertyOptional({ description: 'Calendar event ID for external calendar integration' })
  @IsOptional()
  @IsString()
  calendarEventId?: string;

  @ApiPropertyOptional({ description: 'Video link for video interviews' })
  @IsOptional()
  @IsString()
  videoLink?: string;
}