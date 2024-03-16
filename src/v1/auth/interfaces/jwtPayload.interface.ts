import { IUser, UserRolesEnum, UserTypesEnum } from '../../users';
import { NetworksEnum } from '../enums';
import { IFile } from '@base';

export interface IJwtUser {
    _id: string;
    display_name: string;
    email: string;
    team: string | null;
    iat?: Date;
    password?: string;
    role?: UserRolesEnum;
    type?: UserTypesEnum;
    user_name: string;
}

export interface ISingUpSucces {
    _id: string;
    access_token?: string;
    email: string;
    message?: string;
    role?: string;
    type?: string;
    user?: IUser;
    user_name: string;
}

export interface ISingInSucces {
    access_token: string;
    message: string;
    user: IUser;
}

export interface IActivateAccountSucces {
    email: string;
    message: string;
}

export interface ISocialUser {
    is_active: boolean;
    email_verify: boolean;
    sign_in_method: NetworksEnum;
    photo_url: IFile;
}
export interface DecodedToken {
    email: string;
    email_verified: boolean;
    name: string;
    picture?: string;
  }
