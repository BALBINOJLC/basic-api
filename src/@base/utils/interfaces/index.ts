import { HttpException } from '@nestjs/common';
import { UserRolesEnum, UserTypesEnum } from '@users';
import { Request } from 'express';

export interface IRejectError {
    code: HttpException;
    err: Error;
}

export interface IUserToken {
    _id: string;
    email: string;
    iat?: Date;
    invited: boolean;
    organizationId?: string;
    password?: string;
    role?: UserRolesEnum;
    type?: UserTypesEnum;
    userName: string;
}

export interface RequestWithUser extends Request {
    user: IUserToken;
}
