// Importing Module decorator from NestJS to define a module
import { Module } from '@nestjs/common';
// Importing MongooseModule to register schemas for database operations
import { MongooseModule } from '@nestjs/mongoose';

// Importing RecruitmentController for general recruitment endpoints
import { RecruitmentController } from './recruitment.controller';
// Importing RecruitmentService for general recruitment business logic
import { RecruitmentService } from './recruitment.service';

// Importing OffboardingController to handle termination review endpoints
import { OffboardingController } from './offboarding.controller';
// Importing OffboardingService to handle termination review business logic
import { OffboardingService } from './offboarding.service';

// Importing TerminationRequest schema from models folder to register with MongooseModule
import {
  TerminationRequest,
  TerminationRequestSchema,
} from './models/termination-request.schema';
// Importing Contract schema from models folder to register with MongooseModule
import { Contract, ContractSchema } from './models/contract.schema';
// Importing ClearanceChecklist schema from models folder to register with MongooseModule
import {
  ClearanceChecklist,
  ClearanceChecklistSchema,
} from './models/clearance-checklist.schema';

// Importing AppraisalRecord schema from employee-subsystem/performance to access performance data
import {
  AppraisalRecord,
  AppraisalRecordSchema,
} from '../employee-subsystem/performance/models/appraisal-record.schema';
// Importing EmployeeProfile schema from employee-subsystem/employee to validate employees
import {
  EmployeeProfile,
  EmployeeProfileSchema,
} from '../employee-subsystem/employee/models/employee-profile.schema';

@Module({
  imports: [
    // Registering all required schemas with MongooseModule to make them available for dependency injection
    MongooseModule.forFeature([
      // Registering TerminationRequest schema to interact with termination_requests collection
      { name: TerminationRequest.name, schema: TerminationRequestSchema },
      // Registering Contract schema to interact with contracts collection
      { name: Contract.name, schema: ContractSchema },
      // Registering ClearanceChecklist schema to interact with clearance_checklists collection
      { name: ClearanceChecklist.name, schema: ClearanceChecklistSchema },
      // Registering AppraisalRecord schema from employee-subsystem to access performance data
      { name: AppraisalRecord.name, schema: AppraisalRecordSchema },
      // Registering EmployeeProfile schema from employee-subsystem to validate employee existence
      { name: EmployeeProfile.name, schema: EmployeeProfileSchema },
    ]),
  ],
  // Registering controllers to handle HTTP requests
  controllers: [
    RecruitmentController, // Handles general recruitment endpoints
    OffboardingController, // Handles termination review endpoints (POST /offboarding/initiate-termination-review)
  ],
  // Registering services to provide business logic
  providers: [
    RecruitmentService, // Provides general recruitment business logic
    OffboardingService, // Provides termination review business logic including employee/contract validation and performance data fetching
  ],
})
export class RecruitmentModule {}
