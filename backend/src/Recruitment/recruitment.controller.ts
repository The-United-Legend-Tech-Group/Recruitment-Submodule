import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { RecruitmentService } from './recruitment.service';
import { JobTemplate } from './models/job-template.schema';
import { JobRequisition } from './models/job-requisition.schema';

import { CreateJobTemplateDto } from './dtos/create-job-template.dto';
import { CreateJobRequisitionDto } from './dtos/create-job-requisition.dto';
import { UpdateJobRequisitionDto } from './dtos/update-jobrequisition.dto';


@Controller()
export class RecruitmentController {
  constructor(private readonly recruitmentService: RecruitmentService) { }

  @Get()
  getHello(): string {
    return this.recruitmentService.getHello();
  }
  //REC-003
  @Post('createTemplate')
  async createJobTemplate(@Body() CreateJobTemplateDto: CreateJobTemplateDto): Promise<JobTemplate> {
    return await this.recruitmentService.createjob_template(CreateJobTemplateDto)
  }

  @Post('Requisition')
  async createJobRequisition(@Body() CreateJobRequisitionDto: CreateJobRequisitionDto): Promise<JobRequisition> {
    return await this.recruitmentService.createjob_requision(CreateJobRequisitionDto)
  }

  //HELPS IN Doing REC-0023
  @Patch('Rrequisition/:requisitionid')
  async updateJobRequision(@Param('requisitionid') id: string, @Body() UpdateJobRequisitionDto: UpdateJobRequisitionDto): Promise<JobRequisition> {
    return await this.recruitmentService.updatejob_requisition(id, UpdateJobRequisitionDto)
  }
  //REC-0023
  @Get('Requisition/published')
  async getAllPublishedRequistions(): Promise<JobRequisition[]> {
    return await this.recruitmentService.getAllpublishedJobRequisition();
  }
}
