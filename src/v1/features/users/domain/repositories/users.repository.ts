import { IUserToken, ParamsDto, ResponseDeleted } from '@utils';
import { IRespFindAllUsers, IUser, IUserUpdated } from '../interfaces';
import { UserCreateDto, UserFilterDto, UserUpdateDto } from '../../presentation';
import { UserTypesEnum } from '../enums';

export interface IUserRepository {
    findAll(filter: UserFilterDto, params: ParamsDto, user: IUserToken): Promise<IRespFindAllUsers>;
    findOne(filter: UserFilterDto, fields?: string): Promise<IUser>;
    create(user: UserCreateDto): Promise<IUser>;
    update(id: string, user: UserUpdateDto, userId: string, userType?: UserTypesEnum): Promise<IUserUpdated>;
    delete(id: string): Promise<ResponseDeleted>;
}
