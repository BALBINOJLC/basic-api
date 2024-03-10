import { IsNotEmpty, IsEmail, IsOptional, IsString, IsMongoId, IsDate, IsPhoneNumber, IsBoolean, IsEnum } from 'class-validator';
import { PhotoDto, ResponseList } from '@utils';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { UserDocument } from '../schemas';
import { UserRolesEnum, UserTypesEnum } from '../enums';
import { NetworksEnum } from 'src/v1/auth/enums';

export class UserCreateDto {
    @ApiProperty({ description: 'First name of the user', required: true })
    @IsNotEmpty()
    @IsString()
    first_name: string;

    @ApiProperty({ description: 'Last name of the user', required: true })
    @IsNotEmpty()
    @IsString()
    last_name: string;

    @ApiProperty({ description: 'Display name of the user on the platform', required: true })
    @IsNotEmpty()
    @IsString()
    display_name: string;

    @ApiProperty({ description: 'Passport number of the user', required: false })
    @IsOptional()
    @IsString()
    dni?: string;

    @ApiProperty({ description: 'Phone number of the user', required: false })
    @IsOptional()
    @IsPhoneNumber(undefined, {
        message: 'VALIDATIONS.PHONE_NUMBER_INVALID',
    })
    phone?: string;

    @ApiProperty({ description: 'Phone area code', required: false })
    @IsOptional()
    phone_area?: string;

    @ApiProperty({ description: 'User\'s email address', example: 'user@gmail.com', required: true })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({ description: 'User\'s password', required: true })
    @IsNotEmpty()
    password: string;

    @ApiProperty({ description: 'Role of the user', enum: UserRolesEnum, required: true })
    @IsNotEmpty()
    role: UserRolesEnum;

    @ApiProperty({ description: 'Type of user', enum: UserTypesEnum, enumName: 'UserTypesEnum', required: true })
    @IsNotEmpty()
    type: UserTypesEnum;

    @ApiProperty({ description: 'URL of the user\'s photo', required: false })
    @IsOptional()
    photo_url: PhotoDto;

    @ApiProperty({ description: 'Two-factor authentication status', required: false })
    @IsOptional()
    two_auth?: boolean;

    @ApiProperty({ description: 'ID of the organization the user belongs to', required: false })
    @IsOptional()
    org?: string | null;

    @ApiProperty({ description: 'Country of the user', type: String, example: 'CL', required: false })
    @IsOptional()
    country?: string;

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
}

export class UserUpdateDto extends PartialType(UserCreateDto) {
    @IsOptional()
    @ApiProperty()
    @IsEnum(NetworksEnum)
    signInMethod?: NetworksEnum;
}

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

export class RespUserList extends ResponseList {
    @ApiProperty({ description: 'List of user documents', required: true })
    data: UserDocument[];
}
