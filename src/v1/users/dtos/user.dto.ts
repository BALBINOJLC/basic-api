import {
    IsNotEmpty,
    IsEmail,
    IsOptional,
    IsString,
    IsMongoId,
    IsDate,
    IsPhoneNumber,
    IsBoolean,
    IsEnum,
    ValidateNested,
} from 'class-validator';
import { PhotoDto } from '@common';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { NetworksEnum, UserRolesEnum, UserTypesEnum } from '../enums';

export class UserCreateDto {
    @ApiProperty({ description: 'First name of the user', required: true })
    @IsNotEmpty()
    @IsOptional()
    @IsString()
    first_name: string;

    @ApiProperty({ description: 'Last name of the user', required: true })
    @IsNotEmpty()
    @IsOptional()
    @IsString()
    last_name: string;

    @ApiProperty({ description: 'Phone number of the user', required: false })
    @IsOptional()
    @IsPhoneNumber(undefined, {
        message: 'VALIDATIONS.PHONE_NUMBER_INVALID',
    })
    phone?: string;

    @ApiProperty({ description: 'User email address', example: 'user@gmail.com', required: true })
    @IsNotEmpty()
    @IsOptional()
    @IsEmail()
    email: string;

    @ApiProperty({ description: 'First name of the user', required: true })
    @IsOptional()
    @IsString()
    birthday_date?: string;

    @ApiProperty({ description: 'First name of the user', required: true })
    @IsOptional()
    @IsString()
    dni?: string;

    @ApiProperty({ description: 'First name of the user', required: true })
    @IsOptional()
    @IsString()
    user_name?: string;

    @ApiProperty({ description: 'Display name of the user on the platform', required: true })
    @IsOptional()
    @IsString()
    display_name?: string;

    @ApiProperty({ description: 'Phone area code', required: false })
    @IsOptional()
    phone_area?: string;

    @ApiProperty({ description: 'User password', example: 'user', required: true })
    @IsNotEmpty()
    @IsOptional()
    password: string;

    @ApiProperty({ description: 'Role of the user', enum: UserRolesEnum, required: true })
    @IsNotEmpty()
    @IsOptional()
    role: UserRolesEnum;

    @ApiProperty({ description: 'Type of user', enum: UserTypesEnum, enumName: 'UserTypesEnum', required: true })
    @IsNotEmpty()
    @IsOptional()
    type: UserTypesEnum;

    @ApiProperty({ description: 'Photo of the user', required: false })
    @ValidateNested({ each: true })
    @Type(() => PhotoDto)
    @IsOptional()
    photo_url?: PhotoDto;

    @ApiProperty({ description: 'About of the user', required: false })
    @IsOptional()
    about?: string;

    @ApiProperty({ description: 'Last login date', required: false })
    @IsOptional()
    @IsDate()
    last_login?: Date;

    @IsBoolean()
    @IsOptional()
    @ApiProperty()
    is_active?: boolean;

    @IsBoolean()
    @IsOptional()
    @ApiProperty()
    email_verify?: boolean;

    @IsOptional()
    @ApiProperty()
    @IsEnum(NetworksEnum)
    sign_in_method?: NetworksEnum;
}

export class UserUpdateDto extends PartialType(UserCreateDto) {}

export class UserFilterDto extends PartialType(UserUpdateDto) {
    @ApiProperty({ description: 'Last login date', required: false })
    @IsOptional()
    @IsMongoId()
    readonly _id?: string;

    @ApiProperty({ description: 'Last login date', required: false })
    @IsOptional()
    @IsMongoId()
    readonly user_name?: string;
}

export class MasiveUserDto extends UserCreateDto {}
