import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsStrongPassword } from 'class-validator';

export class LoginUserDto {
    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    @IsStrongPassword()
    password: string;
}

export class PasswordForgotDto {
    @IsEmail()
    email: string;
}

export class ResetPasswordDto {
    @IsString()
    @IsStrongPassword()
    password: string;
}

import { EUserRole } from '@prisma/client';

export class RegisterUserDto {
    @IsString()
    @IsNotEmpty()
    first_name: string;

    @IsString()
    @IsNotEmpty()
    last_name: string;

    @IsString()
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsStrongPassword()
    password: string;
}

export class RegisterMasiveDto {
    @IsString()
    @IsNotEmpty()
    first_name: string;

    @IsString()
    @IsNotEmpty()
    last_name: string;

    @IsString()
    @IsEmail(
        {},
        {
            message: 'AUTH.SIGN_IN.ERROR.EMAIL_INVALID',
        }
    )
    @IsNotEmpty()
    email: string;

    @IsEnum(EUserRole)
    @IsOptional()
    role: EUserRole;
}
