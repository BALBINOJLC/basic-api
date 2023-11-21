import { UserDocument } from '../schemas';

export interface IUserUpdated {
    data: UserDocument;
    message: string;
}

export interface IUserInvited {
    data: UserDocument;
    message: string;
}
