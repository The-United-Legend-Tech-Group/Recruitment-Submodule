// Importing necessary validation decorators from class-validator for input validation
import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
// Importing Type decorator from class-transformer for nested object validation
import { Type } from 'class-transformer';

// Nested DTO class for department approval items in the checklist
// This represents each department that needs to approve the offboarding (IT, Finance, HR, etc.)
export class DepartmentApprovalItemDto {
  // Department name - e.g., "IT", "Finance", "Facilities", "HR", "Admin"
  // IsString validates it's a string type
  // IsNotEmpty ensures this field is mandatory
  @IsString({ message: 'Department name must be a string' })
  @IsNotEmpty({ message: 'Department name is required' })
  department: string;

  // Comments from the department approver - optional field
  // IsOptional makes this field optional
  // IsString validates it's a string type when provided
  @IsOptional()
  @IsString({ message: 'Comments must be a string' })
  comments?: string;
}

// Nested DTO class for equipment items in the checklist
// This represents company equipment that needs to be returned (Laptop, Monitor, Keys, Phone, etc.)
export class EquipmentItemDto {
  // Equipment ID - referencing equipment from another system/subsystem
  // IsMongoId validates it's a valid MongoDB ObjectId
  // IsNotEmpty ensures this field is mandatory
  @IsMongoId({ message: 'Equipment ID must be a valid MongoDB ObjectId' })
  @IsNotEmpty({ message: 'Equipment ID is required' })
  equipmentId: string;

  // Equipment name - descriptive name like "Laptop", "Monitor", "Keys", "Phone"
  // IsString validates it's a string type
  // IsNotEmpty ensures this field is mandatory
  @IsString({ message: 'Equipment name must be a string' })
  @IsNotEmpty({ message: 'Equipment name is required' })
  name: string;

  // Returned status - boolean indicating if the equipment has been returned
  // IsBoolean validates it's a boolean type
  // IsNotEmpty ensures this field is mandatory (must explicitly state true/false)
  @IsBoolean({ message: 'Returned status must be a boolean' })
  @IsNotEmpty({ message: 'Returned status is required' })
  returned: boolean;

  // Condition of the equipment when returned - optional field
  // IsOptional makes this field optional
  // IsString validates it's a string type when provided
  @IsOptional()
  @IsString({ message: 'Condition must be a string' })
  condition?: string;
}

// Main DTO class for initiating an offboarding checklist
export class InitiateOffboardingChecklistDto {
  // Termination Request ID - referencing the TerminationRequest schema from Recruitment models
  // Using IsMongoId to validate it's a valid MongoDB ObjectId
  // IsNotEmpty ensures this field is mandatory
  @IsMongoId({ message: 'Termination ID must be a valid MongoDB ObjectId' })
  @IsNotEmpty({ message: 'Termination ID is required' })
  terminationId: string;

  // Array of department approval items - each department that needs to sign off
  // IsArray validates it's an array type
  // ValidateNested ensures each item in the array is validated using DepartmentApprovalItemDto
  // Type decorator tells class-transformer what type of objects are in the array
  // IsNotEmpty ensures at least one department is specified
  @IsArray({ message: 'Department items must be an array' })
  @ValidateNested({ each: true })
  @Type(() => DepartmentApprovalItemDto)
  @IsNotEmpty({ message: 'At least one department approval item is required' })
  items: DepartmentApprovalItemDto[];

  // Array of equipment items - company property that needs to be returned
  // IsArray validates it's an array type
  // ValidateNested ensures each item in the array is validated using EquipmentItemDto
  // Type decorator tells class-transformer what type of objects are in the array
  // IsNotEmpty ensures at least one equipment item is specified
  @IsArray({ message: 'Equipment list must be an array' })
  @ValidateNested({ each: true })
  @Type(() => EquipmentItemDto)
  @IsNotEmpty({ message: 'At least one equipment item is required' })
  equipmentList: EquipmentItemDto[];

  // Card returned status - boolean indicating if the access card has been returned
  // IsBoolean validates it's a boolean type
  // IsOptional makes this field optional (defaults to false in schema)
  @IsOptional()
  @IsBoolean({ message: 'Card returned status must be a boolean' })
  cardReturned?: boolean;
}
