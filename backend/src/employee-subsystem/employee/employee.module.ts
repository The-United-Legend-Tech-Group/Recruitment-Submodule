import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  EmployeeProfile,
  EmployeeProfileSchema,
} from './models/employee-profile.schema';
import { EmployeeExternalController } from './employee-external.controller';
import { EmployeeExternalService } from './employee-external.service';
import { EmployeeService } from './employee.service';
import { AppraisalRecord, AppraisalRecordSchema } from '../performance/models/appraisal-record.schema';
import { EmployeeProfileRepository } from './repository/employee-profile.repository';
import { EmployeeSystemRoleRepository } from './repository/employee-system-role.repository';
import { EmployeeProfileChangeRequestRepository } from './repository/ep-change-request.repository';
import { EmployeeSystemRole, EmployeeSystemRoleSchema } from './models/employee-system-role.schema';
import { EmployeeProfileChangeRequest, EmployeeProfileChangeRequestSchema } from './models/ep-change-request.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EmployeeProfile.name, schema: EmployeeProfileSchema },
      { name: AppraisalRecord.name, schema: AppraisalRecordSchema },
      { name: EmployeeSystemRole.name, schema: EmployeeSystemRoleSchema },
      { name: EmployeeProfileChangeRequest.name, schema: EmployeeProfileChangeRequestSchema },
    ]),
  ],
  controllers: [EmployeeExternalController],
  providers: [
    EmployeeExternalService,
    EmployeeService,
    EmployeeProfileRepository,
    EmployeeSystemRoleRepository,
    EmployeeProfileChangeRequestRepository,
  ],
  exports: [MongooseModule, EmployeeService],
})
export class EmployeeModule {}
