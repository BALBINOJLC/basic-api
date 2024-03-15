import { IFile, ResponseList } from '@utils';
import { UserRolesEnum, UserTypesEnum } from '../enums';


export interface IUserUpdated {
    data            : IUser;
    message         : string;
    access_token?   : string;
}

export interface IUserInvited {
    data    : IUser;
    message : string;
}

export interface IUser {
    _id             : string | null;
    access_token?   : string;
    password?       : string;
    display_name    : string;
    dni?            : string;
    email           : string;
    email_verify?   : boolean;
    first_name      : string;
    last_name       : string;
    phone?          : string;
    photo_url       : IFile;
    role            : UserRolesEnum;
    two_auth?       : boolean;
    type            : UserTypesEnum;
    user_name?      : string;
    is_active?      : boolean;
}

export interface IRespFindAllUsers extends ResponseList {
    data: IUser[];
}

