/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpStatus, Injectable, Request } from '@nestjs/common';
import * as argon2 from 'argon2';
import { RegisterUserDto } from '../dtos';
import { JwtService } from '@nestjs/jwt';
import { envs } from 'src/config';
import { PrismaService } from '@prisma';
import { ILoginResponse, IRegisterResponse, IResponseVerifyToken } from '../interfaces';
import { IUser } from '@users';
import { CustomError, IRequestWithUser, excludePassword, userNameAndCharter } from '@common';
import { EmailService } from '@email';
import { ValitationsAuthService } from './validations.auth.service';
import { PasswordAuhService } from './password.auth.service';

@Injectable()
export class AuthService {
    valitations = new ValitationsAuthService(this.jwtService, this.prismaS);
    password = new PasswordAuhService(this.prismaS, this._emailService, this.jwtService);

    constructor(
        private readonly jwtService: JwtService,
        private prismaS: PrismaService,
        private _emailService: EmailService
    ) {}

    async verifyToken(token: string): Promise<IResponseVerifyToken> {
        try {
            const { sub, iat, exp, ...user } = this.jwtService.verify(token, {
                secret: envs.jwt.jxt_key,
            });

            return {
                user: user,
                access_token: await this.valitations.signJWT(user),
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

            const token = await this.valitations.signJWT(newUser);
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

            await this.valitations.validatePassword({
                hashPassword: user.password,
                password,
            });
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const rest = excludePassword(user);

            return {
                user: rest,
                access_token: await this.valitations.signJWT(rest),
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
                const token = await this.valitations.signJWT(user);

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

    private async getAuthorization(@Request() req: IRequestWithUser): Promise<string[]> {
        const base64 = (req.headers.authorization || '').split(' ')[1] || '';
        const buff = Buffer.from(base64, 'base64');
        const string = buff.toString('ascii').split(':');
        return string;
    }
}
