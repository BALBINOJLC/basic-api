import { ApiProperty } from '@nestjs/swagger';
import { PhotoDto } from '@utils';
import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

export class SignUpDto {
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
    firstName: string;

    @ApiProperty({
        description: 'Last name of the user',
        example: 'Doe',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    lastName: string;

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
    photoUrl?: PhotoDto;
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

export class SignInTwoAuthDto {
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

export class PasswordChangeDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'New password',
        example: '123456',
    })
    currentPassword: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'New password',
        example: '123456',
    })
    newPassword: string;
}
