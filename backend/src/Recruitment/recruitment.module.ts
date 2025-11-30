import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RecruitmentController } from './recruitment.controller';
import { RecruitmentService } from './recruitment.service';
import { OffboardingController } from './offboarding.controller';
import { OffboardingService } from './offboarding.service';
import {TerminationRequest,TerminationRequestSchema,} from './models/termination-request.schema';
import { Contract, ContractSchema } from './models/contract.schema';
import {ClearanceChecklist,ClearanceChecklistSchema,} from './models/clearance-checklist.schema';
import {AppraisalRecord,AppraisalRecordSchema,} from '../employee-subsystem/performance/models/appraisal-record.schema';
import {
  EmployeeProfile,
  EmployeeProfileSchema,
} from '../employee-subsystem/employee/models/employee-profile.schema';
import {EmployeeSystemRole,EmployeeSystemRoleSchema,} from '../employee-subsystem/employee/models/employee-system-role.schema';

import {Notification,NotificationSchema,} from '../employee-subsystem/notification/schema/notification.schema';
import {LeaveEntitlement,LeaveEntitlementSchema,} from '../leaves/models/leave-entitlement.schema';

import {LeaveType,LeaveTypeSchema,} from '../leaves/models/leave-type.schema';
import {
  EmployeeTerminationResignation,
  EmployeeTerminationResignationSchema,
} from '../payroll/execution/models/EmployeeTerminationResignation.schema';
import { EmployeeModule } from '../employee-subsystem/employee/employee.module';
import { NotificationModule } from '../employee-subsystem/notification/notification.module';
import { LeavesModule } from '../leaves/leaves.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TerminationRequest.name, schema: TerminationRequestSchema },
      { name: Contract.name, schema: ContractSchema },
      { name: ClearanceChecklist.name, schema: ClearanceChecklistSchema },
      { name: AppraisalRecord.name, schema: AppraisalRecordSchema },
      { name: EmployeeProfile.name, schema: EmployeeProfileSchema },
      { name: EmployeeSystemRole.name, schema: EmployeeSystemRoleSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: LeaveEntitlement.name, schema: LeaveEntitlementSchema },
      { name: LeaveType.name, schema: LeaveTypeSchema },
      {
        name: EmployeeTerminationResignation.name,
        schema: EmployeeTerminationResignationSchema,
      },
    ]),
    EmployeeModule,
    NotificationModule,
    LeavesModule,
  ],
  controllers: [
    RecruitmentController,
    OffboardingController,
  ],
  providers: [
    RecruitmentService,
    OffboardingService,
  ],
})
export class RecruitmentModule {}
