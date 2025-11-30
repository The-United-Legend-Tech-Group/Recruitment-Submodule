import { Module } from '@nestjs/common';
import { RecruitmentController } from './recruitment.controller';
import { RecruitmentService } from './recruitment.service';
import { MongooseModule } from '@nestjs/mongoose';
import { JobTemplate, JobTemplateSchema } from './models/job-template.schema';
import { JobRequisition,JobRequisitionSchema } from './models/job-requisition.schema';
import { Application,ApplicationSchema } from './models/application.schema';
import { ApplicationStatusHistory,ApplicationStatusHistorySchema } from './models/application-history.schema';
import { Interview,InterviewSchema } from './models/interview.schema';
import { AssessmentResult,AssessmentResultSchema } from './models/assessment-result.schema';
import { Referral,ReferralSchema } from './models/referral.schema';
import { Offer,OfferSchema } from './models/offer.schema';
import { Contract,ContractSchema } from './models/contract.schema';
import { Document,DocumentSchema } from './models/document.schema';
import { TerminationRequest,TerminationRequestSchema } from './models/termination-request.schema';
import { ClearanceChecklist,ClearanceChecklistSchema } from './models/clearance-checklist.schema';
import { Onboarding,OnboardingSchema } from './models/onboarding.schema';
import { Notification, NotificationSchema } from '../employee-subsystem/notification/models/notification.schema';
import { signingBonus, signingBonusSchema } from '../payroll/config_setup/models/signingBonus.schema';
import { payGrade, payGradeSchema } from '../payroll/config_setup/models/payGrades.schema';
import { EmployeeModule } from '../employee-subsystem/employee/employee.module';
@Module({
  imports:[MongooseModule.forFeature([
      { name: JobTemplate.name, schema: JobTemplateSchema },
      { name: JobRequisition.name, schema: JobRequisitionSchema },
      { name: Application.name, schema: ApplicationSchema },
      { name: ApplicationStatusHistory.name, schema: ApplicationStatusHistorySchema },
      { name: Interview.name, schema: InterviewSchema },
      { name: AssessmentResult.name, schema: AssessmentResultSchema },
      { name: Referral.name, schema: ReferralSchema },
      { name: Offer.name, schema: OfferSchema },
      { name: Contract.name, schema: ContractSchema },
      { name: Document.name, schema: DocumentSchema },
      { name: TerminationRequest.name, schema: TerminationRequestSchema },
      { name: ClearanceChecklist.name, schema: ClearanceChecklistSchema },
      { name: Onboarding.name, schema: OnboardingSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: signingBonus.name, schema: signingBonusSchema },
      { name: payGrade.name, schema: payGradeSchema },
    ]),
    EmployeeModule,
  ],
  controllers: [RecruitmentController],
  providers: [RecruitmentService],
  exports:[RecruitmentService]

})
export class RecruitmentModule {}
