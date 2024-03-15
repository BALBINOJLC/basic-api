import { Request } from 'express';

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

export interface ResponseList {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any[];
    page: number;
    per_page: number;
    total_count: number;
}
