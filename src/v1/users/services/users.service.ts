/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { HttpStatus, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CustomError, IJwtUser, IUserToken, ParamsDto, hassPassword, userNameAndCharter, userjwt } from '@utils';
import { JwtService } from '@nestjs/jwt';
import { IUserRepository } from '../repositories';
import { UserDocument, UserSchemaName } from '../schemas';
import { UserCreateDto, UserFilterDto, UserUpdateDto } from '../dtos';
import { IRespFindAllUsers, IUser, IUserUpdated } from '../interfaces';
import { UserTypesEnum, UserRolesEnum } from '../enums';

@Injectable()
export class UserService implements IUserRepository {
    constructor(
        @InjectModel(UserSchemaName) private model: Model<UserDocument>,
        private jwtService: JwtService
    ) {}

    async findAll(filter: UserFilterDto, params: ParamsDto, user: IUserToken): Promise<IRespFindAllUsers> {
        const query = this.buildQuery(filter, user);

        const { fields, limit, offset, sort } = params;
        const newSort = JSON.parse(sort);

        try {
            let perPage = limit;
            const length = await this.model.find(query).countDocuments();
            const data = (await this.model
                .find(query, fields)
                .sort({ [newSort.field ?? 'display_name']: newSort.order ?? -1 })
                .skip(offset)
                .limit(limit)
                .exec()) as IUser[];
            if (length == 0) {
                return {
                    data: null,
                    page: offset,
                    per_page: perPage,
                    total_count: length,
                };
            }
            if (limit == 0) {
                perPage = length;
            }
            return {
                data,
                page: offset,
                per_page: perPage,
                total_count: length,
            };
        } catch (err) {
            throw new CustomError({
                message: 'USER.ERRORS.FIND',
                statusCode: HttpStatus.BAD_REQUEST,
                module: this.constructor.name,
                innerError: err,
            });
        }
    }

    async search(filter: UserFilterDto, regExp: RegExp, params: ParamsDto, user: IUserToken): Promise<IRespFindAllUsers> {
        const query = this.buildQuery(filter, user);

        const { sort, fields } = params;
        const newSort = JSON.parse(sort);

        try {
            const length = await this.model
                .find(query, fields)
                .or([{ first_name: regExp }, { last_name: regExp }, { display_name: regExp }, { email: regExp }])
                .countDocuments();

            const data = await this.model
                .find(query)
                .or([{ first_name: regExp }, { last_name: regExp }, { display_name: regExp }, { email: regExp }])
                .sort({ [newSort.field]: newSort.order })
                .exec();

            if (length == 0) {
                throw new CustomError({
                    message: 'USER.ERRORS.FIND',
                    statusCode: HttpStatus.BAD_REQUEST,
                    module: this.constructor.name,
                });
            }

            return {
                data,
                page: 0,
                per_page: length,
                total_count: length,
            };
        } catch (err) {
            throw new CustomError({
                message: 'USER.ERRORS.FIND',
                statusCode: HttpStatus.BAD_REQUEST,
                module: this.constructor.name,
                innerError: err,
            });
        }
    }

    async findOne(filter: UserFilterDto, fields?: string): Promise<IUser> {
        const query = {
            ...filter,
            is_deleted: false,
        };

        try {
            const data = await this.model.findOne(query, fields).exec();
            if (data) {
                return data;
            } else {
                throw new CustomError({
                    message: 'USER.ERRORS.UPDATE',
                    statusCode: HttpStatus.BAD_REQUEST,
                    module: this.constructor.name,
                });
            }
        } catch (err) {
            throw new CustomError({
                message: 'USER.ERRORS.UPDATE',
                statusCode: HttpStatus.BAD_REQUEST,
                module: this.constructor.name,
                innerError: err,
            });
        }
    }

    async create(input: UserCreateDto): Promise<IUser> {
        try {
            const newUserDetails = this.prepareNewUserDetails(input);
            const newUser = new this.model(newUserDetails);
            const userDB: IUser = await newUser.save();
            return userDB;
        } catch (err) {
            throw new CustomError({
                message: 'USER.ERRORS.CREATE',
                statusCode: HttpStatus.BAD_REQUEST,
                module: this.constructor.name,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                innerError: err,
            });
        }
    }

    async update(id: string, input: UserUpdateDto, userId: string, userType?: UserTypesEnum): Promise<IUserUpdated> {
        const newInput = this.prepareInput(input, userType);

        try {
            const data = await this.persistUserUpdate(id, newInput, userId);
            return this.buildResponse(data);
        } catch (err) {
            throw new CustomError({
                message: 'USER.ERRORS.UPDATE',
                statusCode: HttpStatus.BAD_REQUEST,
                module: this.constructor.name,
                innerError: err,
            });
        }
    }

    async delete(id: string): Promise<IUserUpdated> {
        try {
            const dataToDelete = await this.model.findById(id).exec();

            if (dataToDelete) {
                const newData = {
                    user_name: `${dataToDelete.user_name}-IsDeleted-${new Date().getTime()}`,
                    email: `${dataToDelete.email}-IsDeleted-${new Date().getTime()}`,
                    dni: `${dataToDelete.dni}-IsDeleted-${new Date().getTime()}`,
                    is_deleted: true,
                    deleted_at: new Date(),
                };
                const data = (await this.model.findByIdAndUpdate(id, newData, { new: true }).exec()) as unknown as IUser;
                const resp = {
                    data,
                    message: 'USER.SUCCESS.DELETED',
                };

                return resp;
            } else {
                throw new CustomError({
                    message: 'TASK.ERRORS.UPDATE',
                    statusCode: HttpStatus.BAD_REQUEST,
                    module: this.constructor.name,
                });
            }
        } catch (err) {
            throw new CustomError({
                message: 'TASK.ERRORS.UPDATE',
                statusCode: HttpStatus.BAD_REQUEST,
                module: this.constructor.name,
                innerError: err,
            });
        }
    }

    async updateMasive(input: UserUpdateDto): Promise<unknown> {
        try {
            const data = await this.model.updateMany({}, input).exec();
            return data;
        } catch (err) {
            throw new CustomError({
                message: 'USER.ERRORS.UPDATE',
                statusCode: HttpStatus.BAD_REQUEST,
                module: this.constructor.name,
            });
        }
    }

    private prepareInput(input: UserUpdateDto, userType?: UserTypesEnum): UserUpdateDto {
        if (input.password) {
            input.password = hassPassword(input.password);
        }

        if (input.first_name || input.last_name) {
            input.display_name = `${input.first_name ?? ''} ${input.last_name ?? ''}`.trim();
        }

        if (input.dni) {
            input.dni = input.dni.replace(/[^\w\s]/gi, '');
        }

        if (input.type === UserTypesEnum.OWNER && userType !== UserTypesEnum.OWNER) {
            delete input.type;
        }

        return input;
    }

    private async persistUserUpdate(id: string, input: UserUpdateDto, userId: string): Promise<IUser> {
        const data = await this.model.findByIdAndUpdate(id, input, { new: true });
        if (!data) {
            throw new Error('User not found or update failed');
        }
        if (String(data._id) === userId) {
            const jwt = this.createJwtPayload(data);
            data.access_token = jwt.token;
        }
        return data;
    }

    private buildResponse(data: IUser): IUserUpdated {
        return {
            data,
            access_token: data.access_token,
            message: 'USER.SUCCESS.UPDATED',
        };
    }

    private prepareNewUserDetails(input: UserCreateDto): Partial<IUser> {
        const userNameAndPhotoUrl = userNameAndCharter(input.email);
        return {
            ...input,
            photo_url: input.photo_url || userNameAndPhotoUrl.photo_url,
            user_name: input.user_name || userNameAndPhotoUrl.user_name,
            display_name: `${input.first_name} ${input.last_name}`,
            role: input.role || UserRolesEnum.USER,
            type: input.type || UserTypesEnum.CLIENT,
            password: hassPassword(input.password),
        };
    }

    private buildQuery(filter: UserFilterDto, user: IUserToken): UserFilterDto {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query: any = { ...filter, isDeleted: false };

        console.log('user', user);

        Object.keys(filter).forEach((key) => {
            if (Array.isArray(filter[key])) {
                query[key] = { $in: filter[key] };
            } else if (typeof filter[key] === 'string' && filter[key].includes(',')) {
                query[key] = { $in: filter[key].split(',') };
            }
        });

        console.dir(query, { depth: null });
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return query;
    }

    private createJwtPayload(user: IUser): { expiresIn: number; token: string } {
        const data: IJwtUser = userjwt(user);
        const jwt = this.jwtService.sign(data);

        return {
            expiresIn: 3600 * 60 * 60 * 24,
            token: jwt,
        };
    }
}
