import { Module } from '@nestjs/common';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JobTemplate, JobTemplateDocument } from './models/job-template.schema';
import { JobRequisition } from './models/job-requisition.schema';

import { CreateJobTemplateDto } from './dtos/create-job-template.dto';
import { CreateJobRequisitionDto } from './dtos/create-job-requisition.dto';
import { UpdateJobRequisitionDto } from './dtos/update-jobrequisition.dto';

@Injectable()
export class RecruitmentService {
  constructor(
    @InjectModel(JobTemplate.name) private jobTemplateModel: Model<JobTemplateDocument>,
    @InjectModel(JobRequisition.name) private jobRequisitionModel: Model<JobRequisition>,


  ) { }
  getHello(): string {
    return 'Hello World!';
  }

  //REC-003: Create Job Template and Job Requisition
  async createjob_template(createjob_template: CreateJobTemplateDto): Promise<JobTemplate> {
    const template = new this.jobTemplateModel(createjob_template)
    return await template.save()
  }
  async createjob_requision(createjob_requision: CreateJobRequisitionDto): Promise<JobRequisition> {
    const templateExists = await this.jobTemplateModel.findById(createjob_requision.templateId).lean();
    if (!templateExists) {
      throw new NotFoundException(`Job template with id ${createjob_requision.templateId} not found`);
    }
    const requisition = new this.jobRequisitionModel(createjob_requision);
    return await requisition.save()
  }

  //HELPS IN Doing REC-023
  async updatejob_requisition(requisitionId: string, updatejob_requisition: UpdateJobRequisitionDto): Promise<JobRequisition> {
    const requisition = await this.jobRequisitionModel.findOneAndUpdate(
      { requisitionId: requisitionId }, // Correct: plain object filter
      updatejob_requisition,
      { new: true }
    );

    if (!requisition) {
      throw new NotFoundException(`Job requisition with requisitionId ${requisitionId} not found`);
    }

    return requisition;
  }
  // REC:-023
  async getAllpublishedJobRequisition(): Promise<JobRequisition[]> {
    return this.jobRequisitionModel
      .find({ publishStatus: 'published' })
      //.populate('templateId')
      //.populate('hiringManagerId', 'name email')
      .exec();
  }

}