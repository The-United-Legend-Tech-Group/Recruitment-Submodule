import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmployeeProfile } from './models/employee-profile.schema';
import { CreateEmployeeDto } from './dto/create-employee.dto';

@Injectable()
export class EmployeeService {
    constructor(
        @InjectModel(EmployeeProfile.name)
        private employeeProfileModel: Model<EmployeeProfile>,
    ) { }

    async onboard(createEmployeeDto: CreateEmployeeDto): Promise<EmployeeProfile> {
        try {
            const createdEmployee = new this.employeeProfileModel(createEmployeeDto);
            return await createdEmployee.save();
        } catch (error) {
            if (error.code === 11000) {
                throw new ConflictException('Employee with this national ID or employee number already exists');
            }
            throw error;
        }
    }
}
