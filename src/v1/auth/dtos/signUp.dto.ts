import { ApiProperty, PartialType } from '@nestjs/swagger';
import { UserCreateDto } from '@users';
import { PhotoDto } from '@utils';
import { Type } from 'class-transformer';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { NetworksEnum } from '../enums';

export class SignUpDto extends PartialType(UserCreateDto) {
    @ApiProperty({
        description: 'Email address of the user',
        example: 'example@example.com',
        required: true,
    })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'Password of the user',
        example: 'password123',
        required: true,
    })
    @IsNotEmpty()
    password: string;

    @ApiProperty({
        description: 'First name of the user',
        example: 'John',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    first_name: string;

    @ApiProperty({
        description: 'Last name of the user',
        example: 'Doe',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    last_name: string;

    @ApiProperty({
        description: 'DNI (Document Number) of the user',
        example: '123456789',
        required: true,
    })
    @IsOptional()
    dni?: string;

    @IsOptional()
    @IsString()
    @ApiProperty()
    socialToken?: string;

    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => PhotoDto)
    @ApiProperty({
        description: 'Photo of the user',
        example: {
            url: 'https://url.amazonaws.com/name_.jpg',
            name: 'name_.jpg',
            key: 'key_.jpg',
            extension: 'jpeg',
            mimetype: 'image/jpeg',
            size: 22073,
            type: 'image',
        },
        required: false,
        type: PhotoDto,
    })
    photo_url?: PhotoDto;

    @IsOptional()
    @IsEnum(NetworksEnum)
    @ApiProperty({
        description: 'Networks',
        example: 'FACEBOOK',
        required: false,
        enum: NetworksEnum,
    })
    network?: NetworksEnum;
}

export class PasswordForgotDto {
    @IsNotEmpty()
    @IsEmail()
    @ApiProperty({
        description: 'User email',
        example: 'user@gmail.com',
    })
    email: string;
}

export class SignInTwoAuth {
    @IsNotEmpty()
    @IsEmail()
    @ApiProperty({
        description: 'User email',
        example: 'user@gmail.com',
    })
    email: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'Code',
        example: '123456',
    })
    code: string;
}
