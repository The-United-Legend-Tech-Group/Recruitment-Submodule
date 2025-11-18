import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Employee, EmployeeSchema } from './schema/employee.schema';
import { EmployeeExternalController } from './employee-external.controller';
import { ApiKeyGuard } from 'src/notification/guards/api-key.guard';
import { EmployeeExternalService } from './employee-external.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Employee.name, schema: EmployeeSchema }]),
  ],
  controllers: [EmployeeExternalController],
  providers: [ApiKeyGuard, EmployeeExternalService],
  exports: [MongooseModule],
})
export class EmployeeModule {}
