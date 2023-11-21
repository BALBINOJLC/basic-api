/* eslint-disable @typescript-eslint/no-unsafe-call */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ParamsDto, PhotoDto, randonColor } from '@utils';
import { Model } from 'mongoose';
import { RespOrganizationsList, CreateOrganizationDto, FilterOrganizationsDto, UpdateOrganizationsDto } from '../dtos';
import { OrgDocument, OrgSchemaName, PivotUserOrgDocument, PivotUserOrgSchemaName } from '../schemas';
import { IRespOrgUpdated } from '../interfaces';
import { UserRolesEnum, UserService, UserTypesEnum } from '@users';

@Injectable()
export class OrganizationsService {
    constructor(
        @InjectModel(OrgSchemaName)
        private readonly model: Model<OrgDocument>,
        @InjectModel(PivotUserOrgSchemaName)
        private readonly modelPivot: Model<PivotUserOrgDocument>,
        private readonly _usersService: UserService
    ) {}

    async create(input: CreateOrganizationDto, userId: string): Promise<OrgDocument> {
        return new Promise<OrgDocument>(async (resolve, reject) => {
            try {
                const logo: PhotoDto = input.logo
                    ? input.logo
                    : {
                          name: 'no-image',
                          color: randonColor(),
                          charter: input.name.charAt(0).toUpperCase(),
                      };

                // create slug from name without spaces and lowercase and remove special characters with regexp
                const slug = input.name
                    .toLowerCase()
                    .replace(/[^\w\s]+/g, '')
                    .replace(/\s+/g, '-');

                const data = new this.model({
                    ...input,
                    logo,
                    slug,
                    owner: userId,
                });

                const DB = await data.save();

                if (DB) {
                    await this._usersService.update(
                        {
                            _id: userId,
                        },
                        {
                            org: String(DB._id),
                            type: UserTypesEnum.ORG,
                            role: UserRolesEnum.ADMIN,
                        },
                        userId
                    );
                }

                // Create PivotUserOrg
                const pivot = new this.modelPivot({
                    org: String(DB._id),
                    user: userId,
                });

                await pivot.save();

                resolve(DB);
            } catch (err) {
                const error = {
                    code: new HttpException('ORG.ERRORS.CREATE', HttpStatus.BAD_REQUEST),
                    err,
                };
                reject(error);
            }
        });
    }

    async findAll(filter: FilterOrganizationsDto, params: ParamsDto): Promise<RespOrganizationsList> {
        const query = {
            ...filter,
            isDeleted: false,
        };
        const { fields, limit, offset, sort } = params;
        const newSort = JSON.parse(sort);
        return new Promise<RespOrganizationsList>(async (resolve, reject) => {
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
                } else {
                    if (limit == 0) {
                        perPage = length;
                    }
                }
                resolve({
                    data,
                    page: offset,
                    per_page: perPage,
                    total_count: length,
                });
            } catch (err) {
                const error = {
                    code: new HttpException('ORG.ERRORS.FIND_ALL', HttpStatus.BAD_REQUEST),
                    err,
                };
                reject(error);
            }
        });
    }

    async search(filter: FilterOrganizationsDto, regExp: RegExp, params: ParamsDto): Promise<RespOrganizationsList> {
        const query = {
            ...filter,
            isDeleted: false,
        };

        const { sort, fields } = params;
        const newSort = JSON.parse(sort);
        return new Promise<RespOrganizationsList>(async (resolve, reject) => {
            try {
                const length = await this.model
                    .find(query, fields)
                    .or([{ firstName: regExp }, { field1: regExp }, { field2: regExp }, { field3: regExp }])
                    .countDocuments();

                const data = await this.model
                    .find(query)
                    .or([{ firstName: regExp }, { lastName: regExp }, { displayName: regExp }, { email: regExp }])
                    .sort({ [newSort.field]: newSort.order })
                    .exec();

                if (length == 0) {
                    resolve({
                        data: [],
                        page: 0,
                        per_page: length,
                        total_count: length,
                    });
                }

                resolve({
                    data,
                    page: 0,
                    per_page: length,
                    total_count: length,
                });
            } catch (err) {
                const error = {
                    code: new HttpException('ORG.ERRORS.FIND', HttpStatus.BAD_REQUEST),
                    err,
                };
                reject(error);
            }
        });
    }

    async findOne(filter: FilterOrganizationsDto, fields?: string): Promise<OrgDocument> {
        const query = {
            ...filter,
            isDeleted: false,
        };

        return new Promise<OrgDocument>(async (resolve, reject) => {
            try {
                const data = await this.model.findOne(query, fields).exec();
                if (data) {
                    resolve(data);
                } else {
                    const error = {
                        code: new HttpException('ORG.ERRORS.NOT_FOUND', HttpStatus.NOT_FOUND),
                        err: null,
                    };
                    reject(error);
                }
            } catch (err) {
                const error = {
                    code: new HttpException('ORG.ERRORS.FIND', HttpStatus.BAD_REQUEST),
                    err,
                };
                reject(error);
            }
        });
    }

    async update(filter: FilterOrganizationsDto, input: UpdateOrganizationsDto, userId: string): Promise<IRespOrgUpdated> {
        const query = {
            ...filter,
            isDeleted: false,
        };

        return new Promise<IRespOrgUpdated>(async (resolve, reject) => {
            try {
                if (input.owner) {
                    const org = await this.model.findOne(query).exec();
                    if (org && String(org.owner._id) !== userId) {
                        const error = {
                            code: new HttpException('ORG.UPDATE.ERRORS.NOT_OWNER', HttpStatus.FORBIDDEN),
                            err: null,
                        };
                        reject(error);
                        return;
                    }
                }
                const data = await this.model.findOneAndUpdate(query, input, { new: true });
                if (data) {
                    resolve({
                        data,
                        message: 'ORG.UPDATE.SUCCESS',
                    });
                } else {
                    const error = {
                        code: new HttpException('ORG.ERRORS.UPDATE.NOT_FOUND', HttpStatus.NOT_FOUND),
                        err: null,
                    };
                    reject(error);
                }
            } catch (err) {
                const error = {
                    code: new HttpException('ORG.ERRORS.UPDATE.BAD_REQUEST', HttpStatus.BAD_REQUEST),
                    err,
                };
                reject(error);
            }
        });
    }

    async delete(id: string, userId: string): Promise<{ message: string }> {
        return new Promise<{ message: string }>(async (resolve, reject) => {
            try {
                const dataToDelete = await this.model.findById(id).exec();
                if (dataToDelete.owner) {
                    if (dataToDelete && String(dataToDelete.owner._id) !== userId) {
                        const error = {
                            code: new HttpException('ORG.DELETE.ERRORS.NOT_OWNER', HttpStatus.FORBIDDEN),
                            err: null,
                        };
                        reject(error);
                        return;
                    }
                }
                if (dataToDelete) {
                    const newData = {
                        name: `${dataToDelete.name}-IsDelete-${new Date().getTime()}`,
                        slug: `${dataToDelete.slug}-IsDelete-${new Date().getTime()}`,
                        isDeleted: true,
                        ownerId: '',
                        deletedAt: new Date(),
                    };
                    await this.model.findByIdAndUpdate(id, newData, { new: true }).exec();

                    const resp = {
                        message: 'ORG.DELETE.SUCCESS',
                    };
                    resolve(resp);
                } else {
                    const error = {
                        code: new HttpException('ORG.ERRORS.NOT_FOUND', HttpStatus.NOT_FOUND),
                        err: null,
                    };
                    reject(error);
                }
            } catch (err) {
                const error = {
                    code: new HttpException('ORG.ERRORS.UPDATE', HttpStatus.BAD_REQUEST),
                    err,
                };
                reject(error);
            }
        });
    }

    async haveOrganizations(filter: FilterOrganizationsDto): Promise<OrgDocument> {
        const query = {
            ...filter,
            isDeleted: false,
        };
        return new Promise<OrgDocument>(async (resolve, reject) => {
            try {
                const data = await this.model.findOne(query).exec();
                if (data) {
                    resolve(data);
                } else {
                    resolve(null);
                }
            } catch (err) {
                const error = {
                    code: new HttpException('ORG.ERRORS.FIND', HttpStatus.BAD_REQUEST),
                    err,
                };
                reject(error);
            }
        });
    }
}
