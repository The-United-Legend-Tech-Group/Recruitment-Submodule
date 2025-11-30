import { Controller, Post, Get, Patch, Body, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { RecruitmentService } from './recruitment.service';
import { UploadSignedContractDto } from './DTO/upload-signed-contract.dto';
import { UploadComplianceDocumentsDto } from './DTO/upload-compliance-documents.dto';
import { HrSignContractDto } from './DTO/hr-sign-contract.dto';
import { CreateOnboardingChecklistDto } from './DTO/create-onboarding-checklist.dto';
import { CreateOnboardingWithDefaultsDto } from './DTO/create-onboarding-with-defaults.dto';
import { GetOnboardingChecklistDto } from './DTO/get-onboarding-checklist.dto';
import { SendOnboardingReminderDto } from './DTO/send-onboarding-reminder.dto';
import { UpdateTaskStatusDto } from './DTO/update-task-status.dto';
import { CancelOnboardingDto } from './DTO/cancel-onboarding.dto';
import { CreateOfferDto } from './DTO/create-offer.dto';
import { AddOfferApproverDto } from './DTO/add-offer-approver.dto';
import { ApproveOfferDto } from './DTO/approve-offer.dto';
import { SendOfferDto } from './DTO/send-offer.dto';
import { CandidateRespondOfferDto } from './DTO/candidate-respond-offer.dto';

@Controller('recruitment')
export class RecruitmentController {
    constructor(private readonly recruitmentService: RecruitmentService) {}

    @Post('offer/create')
    async createOffer(@Body() dto: CreateOfferDto) {
        return this.recruitmentService.createOffer(dto);
    }

    @Post('offer/add-approver')
    async addOfferApprover(@Body() dto: AddOfferApproverDto) {
        return this.recruitmentService.addOfferApprover(dto);
    }

    @Post('offer/approve')
    async approveOffer(@Body() dto: ApproveOfferDto) {
        return this.recruitmentService.approveOffer(dto);
    }

    @Post('offer/send')
    async sendOffer(@Body() dto: SendOfferDto) {
        return this.recruitmentService.sendOffer(dto);
    }

    @Post('offer/candidate-respond')
    async candidateRespondOffer(@Body() dto: CandidateRespondOfferDto) {
        return this.recruitmentService.candidateRespondOffer(dto);
    }

    @Post('contract/sign')
    @UseInterceptors(FilesInterceptor('files'))
    async signContract(
        @Body() dto: UploadSignedContractDto,
        @UploadedFiles() files: any[]
    ) {
        return this.recruitmentService.signContract(dto, files);
    }

    @Post('contract/hr-sign')
    async hrSignContract(@Body() dto: HrSignContractDto) {
        return this.recruitmentService.hrSignContract(dto);
    }

    @Post('documents/upload')
    @UseInterceptors(FilesInterceptor('files'))
    async uploadComplianceDocuments(
        @Body() dto: UploadComplianceDocumentsDto,
        @UploadedFiles() files: any[]
    ) {
        return this.recruitmentService.uploadComplianceDocuments(dto, files);
    }

    @Post('onboarding/checklist')
    async createOnboardingChecklist(@Body() dto: CreateOnboardingChecklistDto) {
        return this.recruitmentService.createOnboardingChecklist(dto);
    }

    @Post('onboarding/checklist/defaults')
    async createOnboardingWithDefaults(@Body() dto: CreateOnboardingWithDefaultsDto) {
        return this.recruitmentService.createOnboardingWithDefaults(dto);
    }

    @Get('onboarding/checklist')
    async getOnboardingChecklist(@Body() dto: GetOnboardingChecklistDto) {
        return this.recruitmentService.getOnboardingChecklist(dto);
    }

    @Post('onboarding/reminders')
    async sendOnboardingReminders(@Body() dto: SendOnboardingReminderDto) {
        return this.recruitmentService.sendOnboardingReminders(dto);
    }

    @Post('onboarding/reminders/all')
    async sendAllOnboardingReminders(@Body() body: { daysBeforeDeadline?: number }) {
        return this.recruitmentService.sendAllOnboardingReminders(body.daysBeforeDeadline || 1);
    }

    @Patch('onboarding/task/status')
    async updateTaskStatus(@Body() dto: UpdateTaskStatusDto) {
        return this.recruitmentService.updateTaskStatus(dto);
    }

    @Post('onboarding/cancel')
    async cancelOnboarding(@Body() dto: CancelOnboardingDto) {
        return this.recruitmentService.cancelOnboarding(dto);
    }
}
