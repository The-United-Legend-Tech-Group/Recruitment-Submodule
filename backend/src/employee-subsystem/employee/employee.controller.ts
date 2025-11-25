import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '../guards/api-key.guard';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { EmployeeService } from './employee.service';


@Controller('employee')
export class EmployeeController {
    constructor(private readonly employeeService: EmployeeService) { }

    @Post('onboard')
    @UseGuards(ApiKeyGuard)
    async onboard(@Body() createEmployeeDto: CreateEmployeeDto) {
        return this.employeeService.onboard(createEmployeeDto);
    }
}
