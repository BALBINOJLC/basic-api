import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { MimeTypeEnum } from '../enums';

export class FileDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty()
    readonly originalname: string;

    @IsNotEmpty()
    @IsString()
    @IsEnum(MimeTypeEnum)
    @ApiProperty()
    readonly mimetype: MimeTypeEnum;

    @IsNotEmpty()
    @ApiProperty()
    readonly buffer: Buffer;

    @IsNotEmpty()
    @IsString()
    @ApiProperty()
    readonly fileUrl: string;

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty()
    readonly size: number;
}
