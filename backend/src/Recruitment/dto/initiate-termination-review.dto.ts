// Importing necessary validation decorators from class-validator for input validation
import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
// Importing the TerminationInitiation enum from the enums folder to validate who is initiating the termination
import { TerminationInitiation } from '../enums/termination-initiation.enum';

// DTO (Data Transfer Object) class for initiating a termination review request
export class InitiateTerminationReviewDto {
  // Employee ID - referencing the employee profile from employee-subsystem
  // Using IsMongoId to validate it's a valid MongoDB ObjectId
  // IsNotEmpty ensures this field is mandatory
  @IsMongoId({ message: 'Employee ID must be a valid MongoDB ObjectId' })
  @IsNotEmpty({ message: 'Employee ID is required' })
  employeeId: string;

  // Initiator - who is initiating the termination (HR, MANAGER, or EMPLOYEE)
  // Using IsEnum to validate against the TerminationInitiation enum values
  // IsNotEmpty ensures this field is mandatory
  @IsEnum(TerminationInitiation, {
    message: 'Initiator must be one of: employee, hr, or manager',
  })
  @IsNotEmpty({ message: 'Initiator is required' })
  initiator: TerminationInitiation;

  // Reason for termination - free text explanation
  // IsString validates it's a string type
  // MinLength ensures the reason has at least 10 characters for meaningful explanation
  // IsNotEmpty ensures this field is mandatory
  @IsString({ message: 'Reason must be a string' })
  @MinLength(10, { message: 'Reason must be at least 10 characters long' })
  @IsNotEmpty({ message: 'Reason is required' })
  reason: string;

  // Employee comments - optional field for employee to add their perspective
  // IsOptional makes this field optional
  // IsString validates it's a string type when provided
  @IsOptional()
  @IsString({ message: 'Employee comments must be a string' })
  employeeComments?: string;

  // HR comments - optional field for HR to add their notes
  // IsOptional makes this field optional
  // IsString validates it's a string type when provided
  @IsOptional()
  @IsString({ message: 'HR comments must be a string' })
  hrComments?: string;

  // Contract ID - referencing the Contract schema from the Recruitment models
  // Using IsMongoId to validate it's a valid MongoDB ObjectId
  // IsNotEmpty ensures this field is mandatory as per the TerminationRequest schema requirement
  @IsMongoId({ message: 'Contract ID must be a valid MongoDB ObjectId' })
  @IsNotEmpty({ message: 'Contract ID is required' })
  contractId: string;
}
