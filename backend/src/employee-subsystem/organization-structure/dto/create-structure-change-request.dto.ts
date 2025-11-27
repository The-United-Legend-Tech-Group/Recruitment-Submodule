import { StructureRequestType } from '../enums/organization-structure.enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStructureChangeRequestDto {
  @ApiProperty({ description: 'Employee id who requested the change' })
  requestedByEmployeeId: string;

  @ApiProperty({ description: 'Type of structure change request', enum: StructureRequestType })
  requestType: StructureRequestType;

  @ApiPropertyOptional({ description: 'Target department id (if applicable)' })
  targetDepartmentId?: string;

  @ApiPropertyOptional({ description: 'Target position id (if applicable)' })
  targetPositionId?: string;

  @ApiPropertyOptional({ description: 'Details of the change request' })
  details?: string;

  @ApiPropertyOptional({ description: 'Reason for the change request' })
  reason?: string;

  // optional field in case submitter differs from requester
  @ApiPropertyOptional({ description: 'Employee id who submitted the request (may differ from requester)' })
  submittedByEmployeeId?: string;
}
