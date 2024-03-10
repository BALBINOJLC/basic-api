/* eslint-disable @typescript-eslint/no-unsafe-call */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { hassPassword, ParamsDto, userNameAndCharter } from '@utils';
import { Model } from 'mongoose';
import { RespUserList, UserCreateDto, UserFilterDto, UserUpdateDto } from '../dtos';
import { IUserInvited, IUserUpdated } from '../interfaces';
import { UserDocument, UserSchemaName } from '../schemas';
import { JwtService } from '@nestjs/jwt';
import { UserRolesEnum, UserTypesEnum } from '../enums';
import { EmailService } from '@email';
import { IJwtUser } from '@auth';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(UserSchemaName)
        private readonly model: Model<UserDocument>,
        private jwtService: JwtService,
        private emailService: EmailService
    ) {}

    async create(input: UserCreateDto): Promise<UserDocument> {
        return new Promise<UserDocument>(async (resolve, reject) => {
            const mewUser = new this.model({
                ...input,
                photoUrl: input.photoUrl || userNameAndCharter(input.email).photoUrl,
                userName: userNameAndCharter(input.email).userName,
                displayName: `${input.firstName} ${input.lastName}`,
                role: input.role || UserRolesEnum.USER,
                type: input.type || UserTypesEnum.CLIENT,
                password: hassPassword(input.password),
            });

            try {
                const userDB = await mewUser.save();
                resolve(userDB);
            } catch (err) {
                console.log('err', err);
                const error = {
                    code: new HttpException('USER.ERRORS.CREATED', HttpStatus.BAD_REQUEST),
                    err,
                };
                reject(error);
            }
        });
    }

    async invite(input: UserCreateDto, org: string, owner: IJwtUser): Promise<IUserInvited> {
        return new Promise<IUserInvited>(async (resolve, reject) => {
            const mewUser = new this.model({ ...input, org });

            try {
                const userDB = (await mewUser.save()) as UserDocument;
                // Create Token
                const jwt = this.createJwtPayload(userDB);
                userDB.accessToken = jwt.token;
                // Send Email
                const token = jwt.token;
                await this.emailService.inviteUser(token, userDB, owner);

                resolve({
                    data: userDB,
                    message: 'USER.SUCCESS.INVITED',
                });
            } catch (err) {
                console.log('err', err);
                const error = {
                    code: new HttpException('USER.ERRORS.CREATED', HttpStatus.BAD_REQUEST),
                    err,
                };
                reject(error);
            }
        });
    }

    async findAll(filter: UserFilterDto, params: ParamsDto): Promise<RespUserList> {
        const query = {
            ...filter,
            is_deleted: false,
        };
        Object.keys(filter).forEach((key) => {
            if (filter[key].toString().includes('!')) {
                query[key] = { $ne: filter[key].replace('!', '') };
            }
        });

        const { fields, limit, offset, sort } = params;
        const newSort = JSON.parse(sort);
        return new Promise<RespUserList>(async (resolve, reject) => {
            try {
                let perPage = limit;
                const length = await this.model.find(query).countDocuments();
                const data = await this.model
                    .find(query, fields)
                    .sort({ [newSort.field]: newSort.order })
                    .skip(offset)
                    .limit(limit)
                    .exec();
                if (length == 0) {
                    resolve({
                        data: [],
                        page: offset,
                        per_page: perPage,
                        total_count: length,
                    });
                }
                if (limit == 0) {
                    perPage = length;
                }
                resolve({
                    data,
                    page: offset,
                    per_page: perPage,
                    total_count: length,
                });
            } catch (err) {
                const error = {
                    code: new HttpException('USER.ERRORS.FIND_ALL', HttpStatus.BAD_REQUEST),
                    err,
                };
                console.log('error', error);

                reject(error);
            }
        });
    }

    async search(filter: UserFilterDto, regExp: RegExp, params: ParamsDto): Promise<RespUserList> {
        const query = {
            ...filter,
            is_deleted: false,
        };

        const { sort, fields } = params;
        const newSort = JSON.parse(sort);
        return new Promise<RespUserList>(async (resolve, reject) => {
            try {
                const length = await this.model
                    .find(query, fields)
                    .or([{ firstName: regExp }, { lastName: regExp }, { displayName: regExp }, { email: regExp }])
                    .countDocuments();

                const data = await this.model
                    .find(query)
                    .or([{ firstName: regExp }, { lastName: regExp }, { displayName: regExp }, { email: regExp }])
                    .sort({ [newSort.field]: newSort.order })
                    .exec();

                if (length == 0) {
                    const error = {
                        code: new HttpException('USER.ERRORS.NOT_FOUND', HttpStatus.NOT_FOUND),
                        err: null,
                    };
                    reject(error);
                }

                resolve({
                    data,
                    page: 0,
                    per_page: length,
                    total_count: length,
                });
            } catch (err) {
                const error = {
                    code: new HttpException('USER.ERRORS.SEARCH', HttpStatus.BAD_REQUEST),
                    err,
                };
                reject(error);
            }
        });
    }

    async findOne(filter: UserFilterDto, fields?: string): Promise<UserDocument> {
        const query = {
            ...filter,
            is_deleted: false,
        };

        return new Promise<UserDocument>(async (resolve, reject) => {
            try {
                const data = await this.model.findOne(query, fields).exec();
                if (data) {
                    resolve(data);
                } else {
                    const error = {
                        code: new HttpException('USER.ERRORS.NOT_FOUND', HttpStatus.NOT_FOUND),
                        err: null,
                    };
                    reject(error);
                }
            } catch (err) {
                const error = {
                    code: new HttpException('USER.ERRORS.FIND', HttpStatus.BAD_REQUEST),
                    err,
                };
                reject(error);
            }
        });
    }

    async update(filter: UserFilterDto, input: UserUpdateDto, userId: string, userType?: UserTypesEnum): Promise<IUserUpdated> {
        const query = {
            ...filter,
            is_deleted: false,
        };

        if (input.password) {
            input.password = await hassPassword(input.password);
        }

        if (input.firstName || input.lastName) {
            input.displayName = `${input.firstName} ${input.lastName}`;
        }

        if (input.dni) {
            input.dni = input.dni.replace(/[^\w\s]/gi, '');
        }

        if (input.type === UserTypesEnum.OWNER && userType === UserTypesEnum.OWNER) {
            input.type = UserTypesEnum.OWNER;
        } else if (input.type === UserTypesEnum.OWNER && userType !== UserTypesEnum.OWNER) {
            delete input.type;
        }

        return new Promise<IUserUpdated>(async (resolve, reject) => {
            try {
                const data = await this.model.findOneAndUpdate(query, input, { new: true });
                if (data) {
                    if (String(data._id) === userId) {
                        const jwt = this.createJwtPayload(data);
                        data.accessToken = jwt.token;
                    }
                    const resp = {
                        data: data,
                        accessToken: data.accessToken,
                        message: 'USER.UPDATE.SUCCESS',
                    };

                    resolve(resp);
                } else {
                    const error = {
                        code: new HttpException('USER.ERRORS.NOT_FOUND', HttpStatus.NOT_FOUND),
                        err: null,
                    };
                    reject(error);
                }
            } catch (err) {
                const error = {
                    code: new HttpException('USER.ERRORS.BAD_REQUEST', HttpStatus.BAD_REQUEST),
                    err,
                };
                reject(error);
            }
        });
    }

    async delete(id: string): Promise<IUserUpdated> {
        return new Promise<IUserUpdated>(async (resolve, reject) => {
            try {
                const dataToDelete = await this.model.findById(id).exec();

                if (dataToDelete) {
                    const newData = {
                        userName: `${dataToDelete.userName}-is_deleted-${new Date().getTime()}`,
                        email: `${dataToDelete.email}-is_deleted-${new Date().getTime()}`,
                        rut: `${dataToDelete.dni}-is_deleted-${new Date().getTime()}`,
                        is_deleted: true,
                        deleted_at: new Date(),
                    };
                    const data = await this.model.findByIdAndUpdate(id, newData, { new: true }).exec();
                    const resp = {
                        data,
                        message: 'USER.SUCCESS.DELETED',
                    };

                    resolve(resp);
                } else {
                    const error = {
                        code: new HttpException('USER.ERRORS.NOT_FOUND', HttpStatus.NOT_FOUND),
                        err: null,
                    };

                    reject(error);
                }
            } catch (err) {
                const error = {
                    code: new HttpException('USER.ERRORS.UPDATE', HttpStatus.BAD_REQUEST),
                    err,
                };
                reject(error);
            }
        });
    }

    async validate(filter: UserFilterDto): Promise<UserDocument> {
        const query = {
            ...filter,
            is_deleted: false,
        };

        return new Promise<UserDocument>(async (resolve, reject) => {
            try {
                const data = await this.model.findOne(query).exec();
                if (data) {
                    resolve(data);
                } else {
                    resolve(null);
                }
            } catch (err) {
                const error = {
                    code: new HttpException('USER.ERRORS.FIND', HttpStatus.BAD_REQUEST),
                    err,
                };
                reject(error);
            }
        });
    }

    createJwtPayload(user: UserDocument): { expiresIn: number; token: string } {
        const data: IJwtUser = {
            _id: user._id,
            userName: user.userName,
            displayName: user.displayName,
            email: user.email,
            role: user.role,
            type: user.type,
        };

        const jwt = this.jwtService.sign(data);

        return {
            expiresIn: 3600 * 60 * 60 * 24,
            token: jwt,
        };
    }

    async updateMasive(input: UserUpdateDto): Promise<unknown> {
        return new Promise(async (resolve, reject) => {
            try {
                const data = await this.model.updateMany({}, input).exec();
                resolve(data);
            } catch (err) {
                const error = {
                    code: new HttpException('REGION.ERRORS.DELETE_MANY', HttpStatus.BAD_REQUEST),
                    err,
                };
                reject(error);
            }
        });
    }
}
