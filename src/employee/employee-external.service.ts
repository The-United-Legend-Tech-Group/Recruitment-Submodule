import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Employee, EmployeeDocument } from './schema/employee.schema';

@Injectable()
export class EmployeeExternalService {
  constructor(
    @InjectModel(Employee.name)
    private readonly employeeModel: Model<EmployeeDocument>,
  ) {}

  private idStr(v: any) {
    return v ? String(v) : null;
  }

  async getForSubsystem(employeeId: string, subsystem: string) {
    const isObjectId = typeof employeeId === 'string' && /^[0-9a-fA-F]{24}$/.test(employeeId);
    const query = isObjectId
      ? { $or: [{ 'employmentDetails.employeeId': employeeId }, { _id: employeeId }] }
      : { 'employmentDetails.employeeId': employeeId };

    const employee = await this.employeeModel.findOne(query).lean().exec();
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const s = (subsystem || '').toLowerCase().trim();

    switch (s) {
      case 'organization-structure':
        return {
          managerId: this.idStr(employee.managerId),
          positionId: this.idStr(employee.positionId),
          departmentId: this.idStr(employee.departmentId),
          firstName: employee.firstName,
          lastName: employee.lastName,
        };

      case 'leaves':
        return {
          hireDate: employee.employmentDetails?.hireDate || null,
          managerId: this.idStr(employee.managerId),
          employmentType: employee.employmentDetails?.employmentType || null,
          email: employee.email,
        };

      case 'payroll':
        return {
          positionId: this.idStr(employee.positionId),
          departmentId: this.idStr(employee.departmentId),
          hireDate: employee.employmentDetails?.hireDate || null,
          employeeId: employee.employmentDetails?.employeeId || null,
          isActive: employee.isActive,
        };

      case 'performance':
        return {
          managerId: this.idStr(employee.managerId),
          departmentId: this.idStr(employee.departmentId),
        };

      case 'time-management':
        return {
          departmentId: this.idStr(employee.departmentId),
          positionId: this.idStr(employee.positionId),
          managerId: this.idStr(employee.managerId),
        };

      default:
        return {
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
        };
    }
  }
}
