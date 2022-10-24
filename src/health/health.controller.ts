import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { apiResponseWrapper, apiErrorWrapper, ErrorResponseDto } from '@utils';
import { HealthService } from './health.service';
import { HealthDto } from './health.dto';

@ApiTags('Health')
@Controller({
    version: '1',
    path: 'health',
})
export class HealthController {
    constructor(private healthService: HealthService) {}

    @ApiOperation({
        summary: 'Ok',
        description: 'Help endpoint to know if the service is operational',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: apiResponseWrapper(String),
        description: 'Ok',
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        type: apiErrorWrapper(ErrorResponseDto),
        description: 'Internal server error',
    })
    @Get()
    getOk(): string {
        return this.healthService.getOk();
    }

    @ApiOperation({
        summary: 'Health',
        description: 'Endpoint displaying information about the microservice',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: apiResponseWrapper(HealthDto),
        description: 'Ok',
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        type: apiErrorWrapper(ErrorResponseDto),
        description: 'Internal server error',
    })
    @Get('/description')
    getHealthCheck(): HealthDto {
        return this.healthService.getHealthCheck();
    }
}
