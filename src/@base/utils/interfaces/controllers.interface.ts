import { Request } from 'express';

export interface IUserToken {
    _id         : string;
    email       : string;
    iat?        : Date;
    invited     : boolean;
    password?   : string;
    role?       : string;
    type?       : string;
    userName    : string;
}

export interface RequestWithUser extends Request {
    user: IUserToken;
}

export interface ResponseList {
    page        : number;
    per_page    : number;
    total_count : number;
}

export interface ResponseDeleted {
   message: string;
}
