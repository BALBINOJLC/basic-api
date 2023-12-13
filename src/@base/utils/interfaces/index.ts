import { HttpException } from '@nestjs/common';

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
    role?: string;
    type?: string;
    userName: string;
}

export interface RequestWithUser extends Request {
    user: IUserToken;
}
