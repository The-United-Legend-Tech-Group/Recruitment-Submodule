// Importing necessary NestJS decorators for creating REST API endpoints
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

// Importing the OffboardingService to handle business logic for termination reviews
import { OffboardingService } from './offboarding.service';
// Importing the DTO for validating the request body structure
import { InitiateTerminationReviewDto } from './dto/initiate-termination-review.dto';
// Importing the DTO for validating the offboarding checklist request body structure
import { InitiateOffboardingChecklistDto } from './dto/initiate-offboarding-checklist.dto';
// Importing the TerminationRequest type to type the response
import { TerminationRequest } from './models/termination-request.schema';
// Importing the ClearanceChecklist type to type the response
import { ClearanceChecklist } from './models/clearance-checklist.schema';

// Controller decorator defines the base route path for all endpoints in this controller
// All routes in this controller will be prefixed with '/offboarding'
@Controller('offboarding')
export class OffboardingController {
  constructor(
    // Injecting OffboardingService to access the business logic methods
    private readonly offboardingService: OffboardingService,
  ) {}

  /**
   * POST endpoint to initiate a termination review
   * Route: POST /offboarding/initiate-termination-review
   * This endpoint allows HR managers to initiate termination reviews based on:
   * - Performance data from employee-subsystem/performance
   * - Manager requests
   * - Employee resignations
   *
   * @param dto - The request body containing termination review details, validated using InitiateTerminationReviewDto
   * @returns The created TerminationRequest document with all details including ID and timestamps
   */
  @Post('initiate-termination-review')
  // HttpCode decorator sets the HTTP status code to 201 (Created) for successful termination request creation
  @HttpCode(HttpStatus.CREATED)
  // UsePipes decorator applies ValidationPipe to validate the request body against the DTO
  // This automatically validates all class-validator decorators in InitiateTerminationReviewDto
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async initiateTerminationReview(
    // Body decorator extracts and validates the request body using InitiateTerminationReviewDto
    @Body() dto: InitiateTerminationReviewDto,
  ): Promise<TerminationRequest> {
    // Call the service method to handle the business logic:
    // 1. Validate employee exists (from employee-subsystem/employee)
    // 2. Validate contract exists (from Recruitment/models/contract.schema)
    // 3. Check for existing termination requests
    // 4. Fetch performance data (from employee-subsystem/performance)
    // 5. Create termination request (using TerminationRequest schema)
    return this.offboardingService.initiateTerminationReview(dto);
  }

  /**
   * POST endpoint to initiate an offboarding checklist
   * Route: POST /offboarding/initiate-checklist
   * This endpoint allows HR managers to create an offboarding checklist that tracks:
   * - Department approvals (IT, Finance, Facilities, HR, Admin)
   * - Equipment returns (Laptop, Monitor, Keys, Phone, etc.)
   * - Access card return status
   *
   * @param dto - The request body containing offboarding checklist details, validated using InitiateOffboardingChecklistDto
   * @returns The created ClearanceChecklist document with all details including ID and timestamps
   */
  @Post('initiate-checklist')
  // HttpCode decorator sets the HTTP status code to 201 (Created) for successful checklist creation
  @HttpCode(HttpStatus.CREATED)
  // UsePipes decorator applies ValidationPipe to validate the request body against the DTO
  // This automatically validates all class-validator decorators in InitiateOffboardingChecklistDto
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async initiateOffboardingChecklist(
    // Body decorator extracts and validates the request body using InitiateOffboardingChecklistDto
    @Body() dto: InitiateOffboardingChecklistDto,
  ): Promise<ClearanceChecklist> {
    // Call the service method to handle the business logic:
    // 1. Validate termination request exists (from Recruitment/models/termination-request.schema)
    // 2. Check for existing checklist to prevent duplicates
    // 3. Process department approval items with PENDING status (using ApprovalStatus enum)
    // 4. Process equipment items with return status
    // 5. Create clearance checklist (using ClearanceChecklist schema)
    return this.offboardingService.initiateOffboardingChecklist(dto);
  }
}
