import { UserRolesEnum, UserTypesEnum } from '@users';


export interface IJwtUser {
    _id         : string;
    display_name: string;
    email       : string;
    team        : string | null;
    iat?        : Date;
    password?   : string;
    role?       : UserRolesEnum;
    type?       : UserTypesEnum;
    user_name   : string;
}