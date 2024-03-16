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
    display_name    : string;
    dni?            : string;
    email           : string;
    email_verify?   : boolean;
    first_name      : string;
    is_active?      : boolean;
    last_name       : string;
    password?       : string;
    phone?          : string;
    photo_url       : IFile;
    role            : UserRolesEnum;
    socialToken?    : string;
    two_auth?       : boolean;
    type            : UserTypesEnum;
    user_name?      : string;
}

export interface IRespFindAllUsers extends ResponseList {
    data: IUser[];
}

