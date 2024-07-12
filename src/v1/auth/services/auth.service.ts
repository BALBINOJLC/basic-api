/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpStatus, Injectable, Logger, Request } from '@nestjs/common';
import * as argon2 from 'argon2';
import { LoginUserDto, RegisterMasiveDto, RegisterUserDto } from '../dtos';
import { JwtService } from '@nestjs/jwt';
import { IJwtPayload, IResponseMessage } from '../interfaces';
import { envs } from 'src/config';
import { PrismaService } from '@prisma';
import { ILoginResponse, IRegisterResponse, IResponseVerifyToken } from '../interfaces';
import { User } from '@prisma/client';
import { IUser } from '@users';
import { CustomError, IRequestWithUser, excludePassword, userNameAndCharter } from '@common';
import { EmailService } from '@email';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(this.constructor.name);
    constructor(
        private readonly jwtService: JwtService,
        private prismaS: PrismaService,
        private _emailService: EmailService
    ) {}

    async signJWT(payload: IJwtPayload): Promise<string> {
        return this.jwtService.sign(payload);
    }

    async verifyToken(token: string): Promise<IResponseVerifyToken> {
        try {
            const { sub, iat, exp, ...user } = this.jwtService.verify(token, {
                secret: envs.jwt.jxt_key,
            });

            return {
                user: user,
                access_token: await this.signJWT(user),
            };
        } catch (error) {
            throw new CustomError({
                statusCode: HttpStatus.UNAUTHORIZED,
                message: 'AUTH.ERRORS.VERIFY_TOKEN',
                module: this.constructor.name,
            });
        }
    }

    async registerUser(registerUserDto: RegisterUserDto): Promise<IRegisterResponse> {
        const { email, first_name, password, last_name } = registerUserDto;

        try {
            const user = await this.prismaS.user.findUnique({
                where: { email },
            });

            if (user) {
                throw new CustomError({
                    statusCode: HttpStatus.CONFLICT,
                    message: 'AUTH.ERRORS.ALREADY_EXISTS',
                    module: this.constructor.name,
                });
            }

            const hashedPassword = await argon2.hash(password);

            const newUser: any = (await this.prismaS.$transaction(async (prisma) => {
                const createdUser = await prisma.user.create({
                    data: {
                        email: email.toLowerCase().trim(),
                        password: hashedPassword,
                        display_name: `${first_name} ${last_name}`,
                        user_name: userNameAndCharter(email).user_name,
                        first_name,
                        last_name,
                        Profiles: {
                            create: {
                                role: 'USER',
                                active: true,
                            },
                        },
                        Avatar: {
                            create: userNameAndCharter(email).Avatar,
                        },
                    },
                });

                return createdUser;
            })) as IUser;

            const token = await this.signJWT(newUser);
            await this._emailService.sendVerificationEmail(token, newUser);

            const { password: _, ...userResponse } = newUser;
            return { user: userResponse };
        } catch (err) {
            throw new CustomError({
                statusCode: err.error?.status ?? HttpStatus.BAD_REQUEST,
                message: err.message ?? 'USER.ERRORS.REGISTER',
                module: this.constructor.name,
                innerError: err,
            });
        }
    }

    async registerUserMasive(registerUserMasiveDto: RegisterMasiveDto[]): Promise<User[]> {
        try {
            const users: User[] = [];
            for (const usersMasive of registerUserMasiveDto) {
                const tempPassword = Math.random().toString(36).slice(-8);
                const hashedPassword = await argon2.hash(tempPassword);
                const { email, first_name, last_name, role } = usersMasive;

                const user = await this.prismaS.user.findUnique({
                    where: { email },
                });
                let newUser;
                if (user) {
                    newUser = await this.prismaS.user.update({
                        where: { email },
                        data: {
                            display_name: `${first_name} ${last_name}`,
                            user_name: userNameAndCharter(email).user_name,
                            first_name,
                            last_name,
                            is_active: true,
                            email_verify: true,
                            Avatar: {
                                update: userNameAndCharter(email).Avatar,
                            },
                        },
                    });
                    await this.prismaS.userProfile.update({
                        where: {
                            user_id: newUser.id,
                        },
                        data: {
                            role: role || 'USER',
                            active: true,
                        },
                    });
                } else {
                    newUser = await this.prismaS.$transaction(
                        async (prisma) => {
                            const createdUser = await prisma.user.create({
                                data: {
                                    email: email.toLowerCase().trim(),
                                    password: hashedPassword,
                                    display_name: `${first_name} ${last_name}`,
                                    user_name: userNameAndCharter(email).user_name,
                                    first_name,
                                    last_name,
                                    is_active: true,
                                    email_verify: true,
                                    Profiles: {
                                        create: {
                                            role: 'ADMIN',
                                            active: true,
                                        },
                                    },
                                    Avatar: {
                                        create: userNameAndCharter(email).Avatar,
                                    },
                                },
                            });
                            return createdUser;
                        },
                        {
                            maxWait: 10000,

                            timeout: 20000,
                        }
                    );
                }

                users.push(newUser);
            }
            return users;
        } catch (err) {
            throw new CustomError({
                statusCode: err.error?.status ?? HttpStatus.BAD_REQUEST,
                message: err.message ?? 'USER.ERRORS.REGISTER',
                module: this.constructor.name,
                innerError: err,
            });
        }
    }

    async loginUser(@Request() req: IRequestWithUser): Promise<ILoginResponse> {
        const athorization = await this.getAuthorization(req);
        const email = athorization[0];
        const password = athorization[1];

        try {
            const user: any = await this.prismaS.user.findUnique({
                where: { email },
                include: {
                    Profiles: {
                        select: {
                            id: true,
                            role: true,
                            active: true,
                        },
                    },
                    Avatar: true,
                },
            });

            if (!user) {
                throw new CustomError({
                    statusCode: HttpStatus.NOT_FOUND,
                    message: 'USER.ERRORS.NOT_FOUND',
                    module: this.constructor.name,
                });
            }

            if (!user.email_verify) {
                throw new CustomError({
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: 'AUTH.ERRORS.SIGNIN.EMAIL_NOT_VERIFIED',
                    module: this.constructor.name,
                });
            }

            await this.validatePassword(user.password, password);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const rest = excludePassword(user);

            return {
                user: rest,
                access_token: await this.signJWT(rest),
            };
        } catch (error) {
            throw new CustomError({
                statusCode: HttpStatus.BAD_REQUEST,
                message: error.message,
                module: this.constructor.name,
                innerError: error.error,
            });
        }
    }

    async setPasswordAdmin(email: string, password: string): Promise<{ message: string }> {
        try {
            const user = await this.prismaS.user.findUnique({
                where: {
                    email,
                },
            });
            if (user) {
                const newPassword = await argon2.hash(password.toString());
                user.password = newPassword;
                await this.prismaS.user.update({
                    where: {
                        email,
                    },
                    data: {
                        password: newPassword,
                    },
                });
                try {
                    const resp = {
                        message: 'AUTH.FORGOT_PASSWORD_SUCCESS',
                        data: user,
                    };
                    return resp;
                } catch (err) {
                    throw new CustomError({
                        statusCode: HttpStatus.BAD_REQUEST,
                        message: 'AUTH.ERRORS.FORGOT_PASSWORD',
                        module: this.constructor.name,
                        innerError: err,
                    });
                }
            } else {
                throw new CustomError({
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: 'USER.ERRORS.NOT_FOUND',
                    module: this.constructor.name,
                });
            }
        } catch (error) {
            throw new CustomError({
                statusCode: HttpStatus.BAD_REQUEST,
                message: error.message,
                module: this.constructor.name,
                innerError: error.error,
            });
        }
    }

    async validateUser(email: string, password: string): Promise<IUser> {
        try {
            const user: any = await this.prismaS.user.findUnique({
                where: { email },
            });
            if (!user) {
                throw new CustomError({
                    statusCode: HttpStatus.NOT_FOUND,
                    message: 'USER.ERRORS.NOT_FOUND',
                    module: this.constructor.name,
                });
            } else if (!user.email_verify) {
                throw new CustomError({
                    statusCode: HttpStatus.FORBIDDEN,
                    message: 'AUTH.ERRORS.SIGNIN.EMAIL_NOT_VERIFIED',
                    module: this.constructor.name,
                });
            } else if (!user.is_active) {
                throw new CustomError({
                    statusCode: HttpStatus.FORBIDDEN,
                    message: 'AUTH.ERRORS.SIGNIN.ACCOUNT_NOT_ACTIVATED',
                    module: this.constructor.name,
                });
            }
            await this.validatePassword(password, user.password);

            return user;
        } catch (error) {
            throw new CustomError({
                statusCode: error?.error.statusCode ?? HttpStatus.BAD_REQUEST,
                message: error.message ?? 'AUTH.ERRORS.VALIDATING_USER',
                module: this.constructor.name,
                innerError: error.error,
            });
        }
    }

    async resetPassword(token: string, password: string): Promise<{ message: string }> {
        try {
            const { email } = this.jwtService.verify(token);
            const user: any = await this.prismaS.user.findUnique({
                where: { email },
            });
            if (!user) {
                throw new CustomError({
                    statusCode: HttpStatus.NOT_FOUND,
                    message: 'USER.ERRORS.NOT_FOUND',
                    module: this.constructor.name,
                });
            }

            await this.validateSamePassword(password, user.password);
            const newPassword = await argon2.hash(password);
            user.password = newPassword;
            await this.prismaS.user.update({
                where: { email },
                data: {
                    password: newPassword,
                },
            });
            const resp = {
                message: 'AUTH.PASSWORD_RESET_SUCCESS',
            };
            return resp;
        } catch (err) {
            throw new CustomError({
                statusCode: err.error?.statusCode ?? HttpStatus.BAD_REQUEST,
                message: err.message ?? 'AUTH.ERRORS.RESET_PASSWORD',
                module: this.constructor.name,
                innerError: err,
            });
        }
    }

    async setNewPasswordAdmin(email: string, password: string): Promise<{ message: string }> {
        try {
            const user: any = await this.prismaS.user.findUnique({
                where: { email },
            });
            if (user) {
                const newPassword = await argon2.hash(password.toString());
                user.password = newPassword;
                await user.save();
                try {
                    const resp = {
                        message: 'AUTH.FORGOT_PASSWORD_SUCCESS',
                        data: user,
                    };
                    return resp;
                } catch (err) {
                    throw new CustomError({
                        statusCode: HttpStatus.BAD_REQUEST,
                        message: 'AUTH.ERRORS.FORGOT_PASSWORD',
                        module: this.constructor.name,
                        innerError: err,
                    });
                }
            } else {
                throw new CustomError({
                    statusCode: HttpStatus.NOT_FOUND,
                    message: 'USER.ERRORS.NOT_FOUND',
                    module: this.constructor.name,
                });
            }
        } catch (err) {
            throw new CustomError({
                statusCode: err.error?.statusCode ?? HttpStatus.BAD_REQUEST,
                message: err.message ?? 'AUTH.ERRORS.SET_NEW_PASSWORD',
                module: this.constructor.name,
                innerError: err,
            });
        }
    }

    async changePassword(@Request() req: IRequestWithUser, currentPassword: string, newPassword: string): Promise<{ message: string }> {
        try {
            const email = req.user.email;

            const validateUser = await this.validateUser(email, currentPassword);
            await this.validateSamePassword(newPassword, validateUser.password);
            return { message: 'ok' };
        } catch (err) {
            throw new CustomError({
                statusCode: err.error?.statusCode ?? HttpStatus.BAD_REQUEST,
                message: err.message ?? 'AUTH.ERRORS.CHANGE_PASSWORD',
                module: this.constructor.name,
                innerError: err,
            });
        }
    }

    async forgotPassword(email: string): Promise<IResponseMessage> {
        try {
            const user = (await this.prismaS.user.findUnique({
                where: { email },
            })) as IUser;
            if (!user) {
                throw new CustomError({
                    statusCode: HttpStatus.NOT_FOUND,
                    message: 'USER.ERRORS.NOT_FOUND',
                    module: this.constructor.name,
                });
            }

            const token = await this.signJWT(user);
            await this._emailService.forgotPassword(token, user);

            const resp = {
                message: 'AUTH.FORGOT_PASSWORD_SUCCESS',
            };
            return resp;
        } catch (err) {
            throw new CustomError({
                statusCode: err.error?.statusCode ?? HttpStatus.BAD_REQUEST,
                message: err.message ?? 'AUTH.ERRORS.FORGOT_PASSWORD',
                module: this.constructor.name,
                innerError: err,
            });
        }
    }

    async activateAccount(token: string) {
        try {
            const { email } = this.jwtService.verify(token);
            const user = (await this.prismaS.user.findUnique({
                where: { email },
            })) as IUser;
            if (user) {
                await this.prismaS.user.update({
                    where: { email },
                    data: {
                        email_verify: true,
                        is_active: true,
                    },
                });
                // refresh token
                const token = await this.signJWT(user);

                const resp = {
                    message: 'AUTH.ACCOUNT_ACTIVATED',
                    email: user.email,
                    token: token,
                };

                return resp;
            } else {
                throw new CustomError({
                    statusCode: HttpStatus.NOT_FOUND,
                    message: 'USER.ERRORS.NOT_FOUND',
                    module: this.constructor.name,
                });
            }
        } catch (err) {
            throw new CustomError({
                statusCode: err.error?.statusCode ?? HttpStatus.BAD_REQUEST,
                message: err.message ?? 'AUTH.ERRORS.ACTIVATE_ACCOUNT',
                module: this.constructor.name,
                innerError: err,
            });
        }
    }

    private async validateSamePassword(password: string, hashPassword: string): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
            const passwordValidation = await argon2.verify(hashPassword, password);
            if (passwordValidation) {
                throw new CustomError({
                    statusCode: HttpStatus.CONFLICT,
                    message: 'AUTH.ERRORS.SIGNIN.PASSWORD_SAME_OLD',
                    module: this.constructor.name,
                });
            } else {
                resolve(passwordValidation);
            }
        });
    }

    private async validatePassword(hashPassword: string, password: string): Promise<boolean> {
        const isPasswordValid = await argon2.verify(hashPassword, password);

        if (!isPasswordValid) {
            throw new CustomError({
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'AUTH.ERRORS.SIGNIN.INVALID_PASSWORD',
                module: this.constructor.name,
            });
        }
        return isPasswordValid;
    }
    private async getAuthorization(@Request() req: IRequestWithUser): Promise<string[]> {
        const base64 = (req.headers.authorization || '').split(' ')[1] || '';
        const buff = Buffer.from(base64, 'base64');
        const string = buff.toString('ascii').split(':');
        return string;
    }
}
