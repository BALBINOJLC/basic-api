import { UserDocument, UserRolesEnum, UserTypesEnum } from '../../users';

export interface IJwtUser {
    _id: string;
    displayName?: string;
    email: string;
    iat?: Date;
    org?: { _id: string; name: string };
    password?: string;
    role?: UserRolesEnum;
    type?: UserTypesEnum;
    userName: string;
}

export interface ISingUpSucces {
    _id: string;
    accessToken?: string;
    email: string;
    message?: string;
    role?: string;
    type?: string;
    user?: UserDocument;
    userName: string;
}

export interface ISingInSucces {
    accessToken: string;
    message: string;
    user: UserDocument;
}

export interface IActivateAccountSucces {
    email: string;
    message: string;
}
