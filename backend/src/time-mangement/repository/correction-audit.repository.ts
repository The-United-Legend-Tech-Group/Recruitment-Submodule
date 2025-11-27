import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { CorrectionAuditDocument } from '../models/correction-audit.schema';
import { BaseRepository } from '../../common/repository/base.repository';

@Injectable()
export class CorrectionAuditRepository extends BaseRepository<CorrectionAuditDocument> {
  constructor(
    @InjectModel('CorrectionAudit') model: Model<CorrectionAuditDocument>,
  ) {
    super(model);
  }
}
