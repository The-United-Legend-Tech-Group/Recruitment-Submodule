// Importing necessary NestJS decorators and exceptions for dependency injection and error handling
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
// Importing InjectModel decorator to inject Mongoose models for database operations
import { InjectModel } from '@nestjs/mongoose';
// Importing Model type from Mongoose for type safety with database operations
import { Model, Types } from 'mongoose';

// Importing the TerminationRequest schema from models folder to interact with termination_requests collection
import {
  TerminationRequest,
  TerminationRequestDocument,
} from './models/termination-request.schema';
// Importing the Contract schema from models folder to validate contract existence and reference
import { Contract, ContractDocument } from './models/contract.schema';
// Importing the ClearanceChecklist schema from models folder to create offboarding checklists
import {
  ClearanceChecklist,
  ClearanceChecklistDocument,
} from './models/clearance-checklist.schema';
// Importing AppraisalRecord schema from employee-subsystem/performance to fetch employee performance data
import {
  AppraisalRecord,
  AppraisalRecordDocument,
} from '../employee-subsystem/performance/models/appraisal-record.schema';
// Importing EmployeeProfile schema from employee-subsystem to validate employee existence
import {
  EmployeeProfile,
  EmployeeProfileDocument,
} from '../employee-subsystem/employee/models/employee-profile.schema';

// Importing the DTO for the termination review initiation request from dto folder
import { InitiateTerminationReviewDto } from './dto/initiate-termination-review.dto';
// Importing the DTO for the offboarding checklist initiation request from dto folder
import { InitiateOffboardingChecklistDto } from './dto/initiate-offboarding-checklist.dto';
// Importing TerminationStatus enum to set the initial status of the termination request
import { TerminationStatus } from './enums/termination-status.enum';
// Importing ApprovalStatus enum to set the initial status of department approvals
import { ApprovalStatus } from './enums/approval-status.enum';

// Injectable decorator makes this service available for dependency injection across the application
@Injectable()
export class OffboardingService {
  constructor(
    // Injecting TerminationRequest model to perform CRUD operations on termination_requests collection
    @InjectModel(TerminationRequest.name)
    private terminationRequestModel: Model<TerminationRequestDocument>,

    // Injecting Contract model to verify the contract exists and belongs to the employee
    @InjectModel(Contract.name)
    private contractModel: Model<ContractDocument>,

    // Injecting ClearanceChecklist model to create and manage offboarding checklists
    @InjectModel(ClearanceChecklist.name)
    private clearanceChecklistModel: Model<ClearanceChecklistDocument>,

    // Injecting AppraisalRecord model from employee-subsystem/performance to fetch performance data
    @InjectModel(AppraisalRecord.name)
    private appraisalRecordModel: Model<AppraisalRecordDocument>,

    // Injecting EmployeeProfile model from employee-subsystem to validate employee existence and status
    @InjectModel(EmployeeProfile.name)
    private employeeProfileModel: Model<EmployeeProfileDocument>,
  ) {}

  /**
   * Main method to initiate a termination review
   * This method validates employee, contract, checks for existing termination requests,
   * fetches performance data, and creates a new termination request
   * @param dto - The data transfer object containing termination review details
   * @returns The created termination request document
   */
  async initiateTerminationReview(
    dto: InitiateTerminationReviewDto,
  ): Promise<TerminationRequest> {
    // Log the initiation of termination review for audit purposes
    console.log(
      `[OffboardingService] Initiating termination review for employee ${dto.employeeId} by ${dto.initiator}`,
    );

    // Convert string employeeId to MongoDB ObjectId for database queries
    const employeeObjectId = new Types.ObjectId(dto.employeeId);
    // Convert string contractId to MongoDB ObjectId for database queries
    const contractObjectId = new Types.ObjectId(dto.contractId);

    // Step 1: Validate that the employee exists in the employee_profiles collection from employee-subsystem
    const employee = await this.employeeProfileModel
      .findById(employeeObjectId)
      .exec();

    // If employee not found, throw NotFoundException to stop the process
    if (!employee) {
      console.error(`[OffboardingService] Employee with ID ${dto.employeeId} not found`);
      throw new NotFoundException(
        `Employee with ID ${dto.employeeId} not found`,
      );
    }

    // Log successful employee validation
    console.log(`[OffboardingService] Employee ${dto.employeeId} validated successfully`);

    // Step 2: Validate that the contract exists in the contracts collection from Recruitment models
    const contract = await this.contractModel.findById(contractObjectId).exec();

    // If contract not found, throw NotFoundException to stop the process
    if (!contract) {
      console.error(`[OffboardingService] Contract with ID ${dto.contractId} not found`);
      throw new NotFoundException(
        `Contract with ID ${dto.contractId} not found`,
      );
    }

    // Log successful contract validation
    console.log(`[OffboardingService] Contract ${dto.contractId} validated successfully`);

    // Step 3: Check if there's already a pending or under_review termination request for this employee
    // Query termination_requests collection to find any active termination requests
    const existingTerminationRequest = await this.terminationRequestModel
      .findOne({
        employeeId: employeeObjectId,
        status: {
          $in: [TerminationStatus.PENDING, TerminationStatus.UNDER_REVIEW],
        },
      })
      .exec();

    // If active termination request exists, throw BadRequestException to prevent duplicate requests
    if (existingTerminationRequest) {
      console.warn(
        `[OffboardingService] Employee ${dto.employeeId} already has an active termination request`,
      );
      throw new BadRequestException(
        `Employee ${dto.employeeId} already has an active termination request with status ${existingTerminationRequest.status}`,
      );
    }

    // Step 4: Fetch the latest performance appraisal record from employee-subsystem/performance
    // This helps justify the termination based on performance data
    const latestAppraisal = await this.appraisalRecordModel
      .findOne({
        employeeProfileId: employeeObjectId,
      })
      .sort({ createdAt: -1 }) // Sort by creation date descending to get the latest record
      .exec();

    // Log whether performance data was found or not
    if (latestAppraisal) {
      console.log(
        `[OffboardingService] Found performance data for employee ${dto.employeeId}: Score ${latestAppraisal.totalScore}, Status: ${latestAppraisal.status}`,
      );
    } else {
      console.log(
        `[OffboardingService] No performance data found for employee ${dto.employeeId}`,
      );
    }

    // Step 5: Create the termination request document with validated data
    // Using TerminationRequest schema from models folder
    const terminationRequest = new this.terminationRequestModel({
      // Setting employeeId from the validated employee ObjectId
      employeeId: employeeObjectId,
      // Setting contractId from the validated contract ObjectId as per TerminationRequest schema requirement
      contractId: contractObjectId,
      // Setting initiator from the DTO (HR, MANAGER, or EMPLOYEE) using TerminationInitiation enum
      initiator: dto.initiator,
      // Setting the reason for termination from the DTO
      reason: dto.reason,
      // Setting optional employee comments if provided in the DTO
      employeeComments: dto.employeeComments,
      // Setting optional HR comments if provided in the DTO
      hrComments: dto.hrComments,
      // Setting initial status to PENDING as per TerminationStatus enum default
      status: TerminationStatus.PENDING,
      // terminationDate will be set later when the request is approved
    });

    // Save the termination request to the database and return the created document
    const savedTerminationRequest = await terminationRequest.save();

    // Log successful creation of termination request
    console.log(
      `[OffboardingService] Termination review initiated successfully for employee ${dto.employeeId} with ID ${savedTerminationRequest._id}`,
    );

    // Return the created termination request document to the controller
    return savedTerminationRequest;
  }

  /**
   * Method to initiate an offboarding checklist
   * This method validates the termination request exists, creates a checklist with
   * department approvals, equipment tracking, and access card return status
   * @param dto - The data transfer object containing offboarding checklist details
   * @returns The created clearance checklist document
   */
  async initiateOffboardingChecklist(
    dto: InitiateOffboardingChecklistDto,
  ): Promise<ClearanceChecklist> {
    // Log the initiation of offboarding checklist for audit purposes
    console.log(
      `[OffboardingService] Initiating offboarding checklist for termination request ${dto.terminationId}`,
    );

    // Convert string terminationId to MongoDB ObjectId for database queries
    const terminationObjectId = new Types.ObjectId(dto.terminationId);

    // Step 1: Validate that the termination request exists in the termination_requests collection
    // Using TerminationRequest model from Recruitment models
    const terminationRequest = await this.terminationRequestModel
      .findById(terminationObjectId)
      .exec();

    // If termination request not found, throw NotFoundException to stop the process
    if (!terminationRequest) {
      console.error(
        `[OffboardingService] Termination request with ID ${dto.terminationId} not found`,
      );
      throw new NotFoundException(
        `Termination request with ID ${dto.terminationId} not found`,
      );
    }

    // Log successful termination request validation
    console.log(
      `[OffboardingService] Termination request ${dto.terminationId} validated successfully`,
    );

    // Step 2: Check if an offboarding checklist already exists for this termination request
    // Query clearance_checklists collection to prevent duplicate checklists
    const existingChecklist = await this.clearanceChecklistModel
      .findOne({
        terminationId: terminationObjectId,
      })
      .exec();

    // If checklist already exists, throw BadRequestException to prevent duplicates
    if (existingChecklist) {
      console.warn(
        `[OffboardingService] Offboarding checklist already exists for termination request ${dto.terminationId}`,
      );
      throw new BadRequestException(
        `Offboarding checklist already exists for termination request ${dto.terminationId}`,
      );
    }

    // Step 3: Process department approval items
    // Map the DTO items to the schema format with default PENDING status from ApprovalStatus enum
    const departmentItems = dto.items.map((item) => ({
      // Department name from the DTO (e.g., "IT", "Finance", "HR")
      department: item.department,
      // Setting initial status to PENDING using ApprovalStatus enum from enums folder
      status: ApprovalStatus.PENDING,
      // Comments from the DTO if provided
      comments: item.comments,
      // updatedBy will be set when a department approves/rejects
      updatedBy: null,
      // updatedAt will be set when a department approves/rejects
      updatedAt: null,
    }));

    // Log the number of departments that need to approve
    console.log(
      `[OffboardingService] Processing ${departmentItems.length} department approval items`,
    );

    // Step 4: Process equipment items
    // Map the DTO equipment items to the schema format, converting string IDs to ObjectIds
    const equipmentItems = dto.equipmentList.map((item) => ({
      // Convert string equipmentId to MongoDB ObjectId for database reference
      equipmentId: new Types.ObjectId(item.equipmentId),
      // Equipment name from the DTO (e.g., "Laptop", "Monitor", "Keys")
      name: item.name,
      // Returned status from the DTO (true/false)
      returned: item.returned,
      // Condition from the DTO if provided (e.g., "Good", "Damaged")
      condition: item.condition,
    }));

    // Log the number of equipment items being tracked
    console.log(
      `[OffboardingService] Processing ${equipmentItems.length} equipment items`,
    );

    // Step 5: Create the clearance checklist document with validated data
    // Using ClearanceChecklist schema from models folder
    const clearanceChecklist = new this.clearanceChecklistModel({
      // Setting terminationId from the validated termination request ObjectId
      // This references the TerminationRequest schema as per ClearanceChecklist schema requirement
      terminationId: terminationObjectId,
      // Setting department approval items with PENDING status
      items: departmentItems,
      // Setting equipment list with return status and condition
      equipmentList: equipmentItems,
      // Setting card returned status from DTO, defaults to false if not provided
      cardReturned: dto.cardReturned ?? false,
    });

    // Save the clearance checklist to the database and return the created document
    const savedChecklist = await clearanceChecklist.save();

    // Log successful creation of offboarding checklist
    console.log(
      `[OffboardingService] Offboarding checklist created successfully with ID ${savedChecklist._id}`,
    );

    // Return the created clearance checklist document to the controller
    return savedChecklist;
  }
}
