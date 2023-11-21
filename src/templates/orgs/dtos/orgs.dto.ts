import { ApiProperty, PartialType } from '@nestjs/swagger';
import { PhotoDto, ResponseList } from '@utils';
import { IsEmail, IsMongoId, IsNotEmpty, IsOptional, IsPhoneNumber, IsString } from 'class-validator';
import { OrgDocument } from '../schemas';

export class CreateOrganizationDto {
    @ApiProperty({
        description: 'The name of the Organization',
        example: 'GUX',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        description: 'The ID of the owner of the Organization',
        example: '5e8f8f8f8f8f8f8f8f8f8f8',
        required: false,
    })
    @IsMongoId()
    @IsOptional()
    owner: string;

    @ApiProperty({
        description: 'The logo of the Organization',
        example: {
            url: 'https://gux-tech.com/logo.png',
        },
        required: false,
    })
    @IsOptional()
    logo: PhotoDto;

    @ApiProperty({
        description: 'The phone number of the Organization',
        example: '123456789',
        required: false,
    })
    @IsOptional()
    @IsPhoneNumber()
    phone: string;

    @ApiProperty({
        description: 'The email address of the Organization',
        example: 'gux@tech.com',
        required: false,
    })
    @IsNotEmpty({
        message: 'API.VALIDATIONS.EMAIL_REQUIRED',
    })
    @IsEmail(
        {},
        {
            message: 'API.VALIDATIONS.EMAIL_INVALID',
        }
    )
    @ApiProperty({
        description: 'The email address of the Organization',
        example: 'gux@tech.com',
        required: false,
    })
    email: string;

    @ApiProperty({
        description: 'The timezone of the Organization',
        example: 'Asia/Ho_Chi_Minh',
        required: false,
    })
    @IsString()
    @IsOptional()
    timezone: string;
}

export class UpdateOrganizationsDto extends PartialType(CreateOrganizationDto) {}

export class FilterOrganizationsDto {
    @IsOptional()
    @IsMongoId()
    @ApiProperty({
        description: 'The Organizations id',
        example: '5e8f8f8f8f8f8f8f8f8f8f8',
    })
    readonly _id?: string;
}
export class RespOrganizationsList extends ResponseList {
    data: OrgDocument[];
}
