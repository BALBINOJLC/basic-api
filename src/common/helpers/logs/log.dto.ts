/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { LogTypeEnum } from './log.enum';

export class LogDto {
    @ApiProperty({ description: 'User name associated with the log', required: true })
    @IsString()
    @IsOptional()
    user_name: string;

    @ApiProperty({ description: 'Type of log', required: true })
    @IsEnum(LogTypeEnum)
    @IsNotEmpty()
    type: LogTypeEnum;

    @ApiProperty({ description: 'Module where the log was generated', required: true })
    @IsNotEmpty()
    module: string;

    @ApiProperty({ description: 'Description of the action performed', required: true })
    @IsString()
    @IsOptional()
    actionDescription: string;

    @ApiProperty({ description: 'Error object associated with the log, if any', required: true, type: 'object' })
    @IsOptional()
    error: any;

    @ApiProperty({ description: 'IP address from where the action was performed', required: false })
    @IsString()
    @IsOptional()
    ip_address: string;
}
