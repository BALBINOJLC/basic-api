import { IRespFindAllUsers, IUser, IUserUpdated, ResponseDeleted } from '../interfaces';
import { UserTypesEnum } from '../enums';
import { UserCreateDto, UserFilterDto, UserUpdateDto } from '../dtos';
import { IUserToken, ParamsDto } from '@common';

export abstract class IUserRepository {
    abstract findAll(filter: UserFilterDto, params: ParamsDto, user: IUserToken): Promise<IRespFindAllUsers>;
    abstract findOne(filter: UserFilterDto, fields?: string): Promise<IUser>;
    abstract create(user: UserCreateDto): Promise<IUser>;
    abstract update(id: string, user: UserUpdateDto, userId: string, userType?: UserTypesEnum): Promise<IUserUpdated>;
    abstract delete(id: string): Promise<ResponseDeleted>;
}
