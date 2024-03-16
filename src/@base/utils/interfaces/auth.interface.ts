import { IUser, UserRolesEnum, UserTypesEnum } from '@users';


export interface IJwtUser {
    _id         : string;
    display_name: string;
    email       : string;
    iat?        : Date;
    password?   : string;
    role?       : UserRolesEnum;
    type?       : UserTypesEnum;
    user_name   : string;
}

export interface ValidationResult {
    isValid: boolean;
    user: IUser;
  }