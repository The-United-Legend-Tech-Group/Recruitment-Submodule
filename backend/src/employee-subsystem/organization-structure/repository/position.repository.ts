import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from './base.repository';
import { Position, PositionDocument } from '../models/position.schema';

@Injectable()
export class PositionRepository extends BaseRepository<PositionDocument> {
    constructor(
        @InjectModel(Position.name) private positionModel: Model<PositionDocument>,
    ) {
        super(positionModel);
    }
}
