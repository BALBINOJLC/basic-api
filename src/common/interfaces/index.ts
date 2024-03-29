import { HttpException } from '@nestjs/common';
import { UserRolesEnum, UserTypesEnum } from '@users';
import { Request } from 'express';
import { MonthsEnum } from '../enums';

export interface IRejectError {
    code: HttpException;
    err: Error;
}

export interface IUserToken {
    _id: string;
    email: string;
    iat?: Date;
    invited: boolean;
    org?: {
        _id: string;
        name: string;
    };
    password?: string;
    role?: UserRolesEnum;
    type?: UserTypesEnum;
    team?: string | null;
    user_name: string;
}

export interface RequestWithUser extends Request {
    user: IUserToken;
}

export interface IFile {
    url?: string;
    name: string;
    key?: string;
    extension?: string;
    mimetype?: string;
    size?: number;
    type?: string;
    charter?: string;
    color?: string;
    bucket?: string;
    path?: string;
}

export interface ICosts {
    month: MonthsEnum;
    year: number;
    cost: number;
}
