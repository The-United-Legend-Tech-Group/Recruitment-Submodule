import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { RecruitmentService } from './recruitment.service';
import { JobTemplateDocument } from './models/job-template.schema';
import { JobRequisitionDocument } from './models/job-requisition.schema';
import { DocumentDocument } from './models/document.schema';
import { ApplicationDocument } from './models/application.schema';

import { CreateJobTemplateDto } from './dtos/create-job-template.dto';
import { CreateJobRequisitionDto } from './dtos/create-job-requisition.dto';
import { UpdateJobRequisitionDto } from './dtos/update-jobrequisition.dto';
import { CreateCVDocumentDto } from './dtos/create-cv-document.dto';
import { CreateApplicationDto } from './dtos/create-application.dto';
import { UpdateApplicationDto } from './dtos/update-application.dto';


@Controller()
export class RecruitmentController {
  constructor(private readonly recruitmentService: RecruitmentService) { }

  @Get()
  getHello(): string {
    return this.recruitmentService.getHello();
  }
  //REC-003
  @Post('createTemplate')
  async createJobTemplate(@Body() CreateJobTemplateDto: CreateJobTemplateDto): Promise<JobTemplateDocument> {
    return await this.recruitmentService.createjob_template(CreateJobTemplateDto)
  }

  @Post('Requisition')
  async createJobRequisition(@Body() CreateJobRequisitionDto: CreateJobRequisitionDto): Promise<JobRequisitionDocument> {
    return await this.recruitmentService.createjob_requision(CreateJobRequisitionDto)
  }

  //HELPS IN Doing REC-0023
  @Patch('Rrequisition/:requisitionid')
  async updateJobRequision(@Param('requisitionid') id: string, @Body() UpdateJobRequisitionDto: UpdateJobRequisitionDto): Promise<JobRequisitionDocument> {
    return await this.recruitmentService.updatejob_requisition(id, UpdateJobRequisitionDto)
  }
  //REC-0023
  @Get('Requisition/published')
  async getAllPublishedRequistions(): Promise<JobRequisitionDocument[]> {
    return await this.recruitmentService.getAllpublishedJobRequisition();
  }

  //REC-007
  @Post('CVdocument')
  async uploadDocument(@Body() documentDto: CreateCVDocumentDto): Promise<DocumentDocument> {
    return this.recruitmentService.createCVDocument(documentDto);
  }

  //REC-007
  @Post('Application')
  async createApplication(@Body() createApplicationDto: CreateApplicationDto): Promise<ApplicationDocument> {
    return this.recruitmentService.createApplication(createApplicationDto);
  }
  @Get('Application/:candidateId')
  async getApplicationsByCandidate(@Param('candidateId') candidateId: string): Promise<ApplicationDocument[]> {
    return this.recruitmentService.getallcandidateApplications(candidateId);
  }

  //REC-017: Update Application Status/Stage
  @Patch('Application/:candidateId/:requisitionId')
  async updateApplication(
    @Param('candidateId') candidateId: string,
    @Param('requisitionId') requisitionId: string,
    @Body() updateApplicationDto: UpdateApplicationDto
  ): Promise<ApplicationDocument> {
    return this.recruitmentService.updateApplication(candidateId, requisitionId, updateApplicationDto);
  }
}
