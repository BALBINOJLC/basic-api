import { IUserToken, ParamsDto, ResponseDeleted } from '@utils';
import { IRespFindAllUsers, IUser, IUserUpdated } from '../interfaces';
import { UserTypesEnum } from '../enums';
import { UserCreateDto, UserFilterDto, UserUpdateDto } from '../dtos';

export interface IUserRepository {
    findAll(filter: UserFilterDto, params: ParamsDto, user: IUserToken): Promise<IRespFindAllUsers>;
    findOne(filter: UserFilterDto, fields?: string): Promise<IUser>;
    create(user: UserCreateDto): Promise<IUser>;
    update(id: string, user: UserUpdateDto, userId: string, userType?: UserTypesEnum): Promise<IUserUpdated>;
    delete(id: string): Promise<ResponseDeleted>;
}
