/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable max-lines */
import { HttpException, HttpStatus, Injectable, Request } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { IUser, UserCreateDto, UserDocument, UserRolesEnum, UserService, UserTypesEnum } from '@users';
import { SignUpDto } from '../dtos';
import { CustomError, RequestWithUser, generateUniqueRandomNumber, userjwt } from '@utils';

import { Twilio } from 'twilio';
import { envs } from 'src/config/envs';
import { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message';
import { InjectModel } from '@nestjs/mongoose';
import { CodesDocument, CodesSchemaName } from '../schemas';

import { Model } from 'mongoose';
import { IActivateAccountSucces, ISingInSucces, ISingUpSucces } from '../interfaces';

import * as admin from 'firebase-admin';
import * as fs from 'fs';
import { NetworksEnum } from '../enums';
import { SocialAuthService } from './social.auth.service';
import { CommonAuthServise } from './comom.auth.service';
import { EmailService } from '@email';

@Injectable()
export class AuthService {
    fGoogleAuth = new SocialAuthService(this._userService, this.jwtService);

    fComomnAuth = new CommonAuthServise(this.jwtService);

    private client: Twilio;

    private phone_number = '+***********';

    constructor(
        private _userService: UserService,
        private jwtService: JwtService,
        @InjectModel(CodesSchemaName)
        private readonly model: Model<CodesDocument>,
        private _emailService: EmailService
    ) {
        const accountSid = envs.twilio.account_sid;
        const authToken = envs.twilio.auth_token;

        this.client = new Twilio(accountSid, authToken);
        this.phone_number = envs.twilio.twilio_phone;

        // Inicializar la app de Firebase
        const serviceAccount = JSON.parse(fs.readFileSync('firebase-admin.json', 'utf8'));
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: 'https://sicrux-teams.firebaseio.com',
        });
    }

    async signUp(input: SignUpDto, invited: boolean, sendEmail: boolean): Promise<ISingUpSucces> {
        if (input.dni) {
            input.dni.replace(/[^\w\s]/gi, '');
        }

        try {
            if (input.socialToken && input.network === NetworksEnum.GOOGLE) {
                const response = await this.fGoogleAuth.signUpUserGoogle(input);
                return response;
            }
            const newUser: UserCreateDto = {
                ...input,
                role: input.role || UserRolesEnum.USER,
                type: input.type || UserTypesEnum.ORG,
            };
            const user = (await this._userService.create(newUser)) as unknown as IUser;
            const userJwt = userjwt(user);
            const token = this.fComomnAuth.createJwtPayload(userJwt);
            try {
                if (sendEmail) {
                    // unhash user.password
                    await this._emailService.verifyAccount(token.token, user, invited);
                }
                return {
                    user_name: user.user_name,
                    email: user.email,
                    _id: user._id,
                    message: 'AUTH.SIGNUP_SUCCESS',
                };
            } catch (error) {
                throw new CustomError({
                    message: 'AUTH.ERRORS.SIGNUP.EMAIL_NOT_SEND',
                    statusCode: HttpStatus.BAD_REQUEST,
                    module: 'AuthService',
                    innerError: error,
                });
            }
        } catch (error) {
            throw new CustomError({
                message: 'AUTH.ERRORS.SIGNUP',
                statusCode: HttpStatus.BAD_REQUEST,
                module: 'AuthService',
                innerError: error,
            });
        }
    }

    async signIn(@Request() req: RequestWithUser): Promise<ISingInSucces> {
        return new Promise<ISingInSucces>(async (resolve, reject) => {
            try {
                const athorization = await this.getAuthorization(req);
                const email = athorization[0];
                const password = athorization[1];
                // Validate SignIn Social Network
                const netWork = athorization[2] as NetworksEnum;
                const socialToken = athorization[3];
                let datavalidation = null;

                if (netWork && socialToken) {
                    switch (netWork) {
                        case NetworksEnum.GOOGLE:
                            datavalidation = await this.fGoogleAuth.validateTokenGoogle(socialToken);

                            if (datavalidation.isValid) {
                                const user = await this.validateUserSocial(email, datavalidation.isValid);
                                if (user && typeof user !== 'boolean') {
                                    const userUpdated = await this._userService.update(
                                        String(user._id),
                                        {
                                            last_login: new Date(),
                                            is_active: datavalidation.isValid,
                                            email_verify: datavalidation.isValid,
                                            sign_in_method: netWork,
                                        },
                                        String(user._id)
                                    );
                                    const userJwt = userjwt(user);
                                    const jwt = this.fComomnAuth.createJwtPayload(userJwt);
                                    resolve({
                                        access_token: jwt.token,
                                        user: userUpdated.data,
                                        message: 'AUTH.SIGNIN_SUCCESS',
                                    });
                                    return;
                                } else {
                                    const newUser = await this.signUp(datavalidation.user, false, false);
                                    const userLogged = await this._userService.update(
                                        String(newUser._id),
                                        {
                                            last_login: new Date(),
                                        },
                                        String(newUser._id)
                                    );
                                    const userJwt = userjwt(userLogged.data);
                                    const jwt = this.fComomnAuth.createJwtPayload(userJwt);
                                    resolve({
                                        access_token: jwt.token,
                                        user: userLogged.data,
                                        message: 'AUTH.SIGNIN_SUCCESS',
                                    });
                                    return;
                                }
                            }

                            break;

                        default:
                            break;
                    }
                }
                const user = await this.validateUser(email, password);
                await this._userService.update(String(user._id), { last_login: new Date() }, String(user._id));
                const userJwt = userjwt(user);
                const jwt = this.fComomnAuth.createJwtPayload(userJwt);
                resolve({
                    access_token: jwt.token,
                    user,
                    message: 'AUTH.SIGNIN_SUCCESS',
                });
            } catch (err) {
                reject(err);
            }
        });
    }

    async signInTwoAuth(code: string, email: string): Promise<ISingInSucces> {
        return new Promise<ISingInSucces>(async (resolve, reject) => {
            try {
                const user = await this._userService.validate({ email });

                if (user) {
                    const validateCode = await this.model.findOne({ code, email, is_deleted: false });

                    if (validateCode) {
                        await this._userService.update(String(user._id), { last_login: new Date() }, String(user._id));
                        const userJwt = userjwt(user);
                        const jwt = this.fComomnAuth.createJwtPayload(userJwt);
                        await this.model.findByIdAndUpdate(String(validateCode._id), {
                            is_deleted: true,
                            deleted_at: new Date(),
                            code: `${validateCode.code}-is_deleted-${new Date().getTime()}`,
                        });
                        resolve({
                            access_token: jwt.token,
                            user,
                            message: 'AUTH.SIGNIN_SUCCESS',
                        });
                    } else {
                        const error = {
                            code: new HttpException('AUTH.ERRORS.SIGNIN.TWOAUTH_CODE_INVALID', HttpStatus.BAD_REQUEST),
                            err: null,
                        };
                        reject(error);
                    }
                } else {
                    const error = {
                        code: new HttpException('AUTH.ERRORS.SIGNIN.USER_NOT_FOUND', HttpStatus.NOT_FOUND),
                        err: null,
                    };
                    reject(error);
                }
            } catch (err) {
                reject(err);
            }
        });
    }

    async forgotPassword(email: string): Promise<{ message: string }> {
        return new Promise<{ message: string }>(async (resolve, reject) => {
            try {
                const user = (await this._userService.findOne({ email }, 'email user_name role type')) as unknown as UserDocument;
                if (user) {
                    try {
                        const token = this.jwtService.sign({ email: user.email });
                        await this._emailService.forgotPassword(token, user);
                        const resp = {
                            message: 'AUTH.FORGOT_PASSWORD_SUCCESS',
                        };
                        resolve(resp);
                    } catch (err) {
                        reject(err);
                    }
                } else {
                    const error = {
                        code: new HttpException('AUTH.ERRORS.FORGOT_PASSWORD.USER_NOT_FOUND', HttpStatus.NOT_FOUND),
                        err: null,
                    };
                    reject(error);
                }
            } catch (err) {
                reject(err);
            }
        });
    }

    async checkToken(@Request() req: RequestWithUser): Promise<Record<string, unknown>> {
        return req.headers;
    }

    async validateUser(email: string, password: string): Promise<IUser> {
        return new Promise<IUser>(async (resolve, reject) => {
            try {
                const user = (await this._userService.findOne({ email })) as unknown as IUser;

                if (!user) {
                    const error = {
                        code: new HttpException('AUTH.ERRORS.SIGNIN', HttpStatus.BAD_REQUEST),
                        err: null,
                    };
                    reject(error);
                } else if (!user.email_verify) {
                    const error = {
                        code: new HttpException('AUTH.ERRORS.SIGNIN.EMAIL_NOT_VERIFIED', HttpStatus.FORBIDDEN),
                        err: null,
                    };
                    reject(error);
                } else if (!user.is_active) {
                    const error = {
                        code: new HttpException('AUTH.ERRORS.SIGNIN.ACCOUNT_NOT_ACTIVATED', HttpStatus.FORBIDDEN),
                        err: null,
                    };
                    reject(error);
                }
                await this.validatePassword(password, user.password);

                resolve(user);
            } catch (error) {
                reject(error);
            }
        });
    }

    async getAuthorization(@Request() req: RequestWithUser): Promise<string[]> {
        const base64 = (req.headers.authorization || '').split(' ')[1] || '';
        const buff = Buffer.from(base64, 'base64');
        const string = buff.toString('ascii').split(':');
        return string;
    }

    async activateAccount(token: string): Promise<IActivateAccountSucces> {
        return new Promise<IActivateAccountSucces>(async (resolve, reject) => {
            try {
                const payload = this.jwtService.verify(token);
                const user = await this._userService.findOne({ email: payload.email });
                if (user) {
                    await this._userService.update(String(user._id), { email_verify: true, is_active: true }, String(user._id));
                    const resp = {
                        message: 'AUTH.ACCOUNT_ACTIVATED',
                        email: user.email,
                    };
                    resolve(resp);
                } else {
                    const error = {
                        code: new HttpException('AUTH.ERRORS.ACTIVATE_ACCOUNT.USER_NOT_FOUND', HttpStatus.NOT_FOUND),
                        err: null,
                    };
                    reject(error);
                }
            } catch (err) {
                reject(err);
            }
        });
    }

    async resetPassword(token: string, password: string): Promise<{ message: string }> {
        return new Promise<{ message: string }>(async (resolve, reject) => {
            try {
                const payload = this.jwtService.verify(token);
                const user = await this._userService.findOne({ email: payload.email });
                if (user) {
                    await this.validateSamePassword(password, user.password);
                    const newPassword = await bcrypt.hash(password.toString(), 10);
                    await this._userService.update(String(user._id), { password: newPassword }, String(user._id));
                    const resp = {
                        message: 'AUTH.PASSWORD_RESET_SUCCESS',
                    };
                    resolve(resp);
                } else {
                    const error = {
                        code: new HttpException('AUTH.ERRORS.RESET_PASSWORD.USER_NOT_FOUND', HttpStatus.NOT_FOUND),
                        err: null,
                    };
                    reject(error);
                }
            } catch (err) {
                reject(err);
            }
        });
    }

    async changePassword(@Request() req: RequestWithUser, currentPassword: string, newPassword: string): Promise<{ message: string }> {
        return new Promise<{ message: string }>(async (resolve, reject) => {
            try {
                const email = req.user.email;

                const validateUser = await this.validateUser(email, currentPassword);
                await this.validateSamePassword(newPassword, validateUser.password);
                resolve({ message: 'ok' });
            } catch (err) {
                reject(err);
            }
        });
    }

    async setNewPasswordAdmin(email: string, passwrod: string): Promise<{ message: string }> {
        return new Promise<{ message: string }>(async (resolve, reject) => {
            try {
                const user = await this._userService.findOne({ email }, 'email user_name role type');
                if (user) {
                    const newPassword = await bcrypt.hash(passwrod.toString(), 10);
                    await this._userService.update(String(user._id), { password: newPassword }, String(user._id));
                    try {
                        const resp = {
                            message: 'AUTH.FORGOT_PASSWORD_SUCCESS',
                            data: user,
                        };
                        resolve(resp);
                    } catch (err) {
                        reject(err);
                    }
                } else {
                    const error = {
                        code: new HttpException('AUTH.ERRORS.FORGOT_PASSWORD.USER_NOT_FOUND', HttpStatus.NOT_FOUND),
                        err: null,
                    };
                    reject(error);
                }
            } catch (err) {
                reject(err);
            }
        });
    }

    async sendCode(phone: string, message: string): Promise<MessageInstance> {
        return new Promise<MessageInstance>(async (resolve, reject) => {
            try {
                const resp = await this.client.messages.create({
                    body: message,
                    from: this.phone_number,
                    to: phone,
                });

                resolve(resp);
            } catch (err) {
                reject(err);
            }
        });
    }

    async generateCode(email: string): Promise<CodesDocument> {
        return new Promise<CodesDocument>(async (resolve, reject) => {
            try {
                const code = generateUniqueRandomNumber().toString();
                const payload = {
                    email,
                    code,
                };
                const newCode = new this.model(payload);
                const codeDb = await newCode.save();
                resolve(codeDb);
            } catch (err) {
                reject(err);
            }
        });
    }

    private async validatePassword(password: string, hashPassword: string): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
            const passwordValidation = await bcrypt.compare(password, hashPassword);

            if (!passwordValidation) {
                const error = {
                    code: new HttpException('AUTH.ERRORS.SIGNIN.INCORRECT_PASSWORD', HttpStatus.FORBIDDEN),
                    err: null,
                };
                reject(error);
            }
            resolve(passwordValidation);
        });
    }

    private async validateSamePassword(password: string, hashPassword: string): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
            const passwordValidation = await bcrypt.compare(password, hashPassword);

            if (passwordValidation) {
                const error = {
                    code: new HttpException('AUTH.ERRORS.PASSWORD_SAME_OLD', HttpStatus.CONFLICT),
                    err: null,
                };
                reject(error);
            } else {
                resolve(passwordValidation);
            }
        });
    }

    private async validateUserSocial(email: string, isVerified: boolean) {
        return new Promise<IUser | boolean>(async (resolve, reject) => {
            try {
                const user = await this._userService.validate({ email });

                if (!user) {
                    resolve(false);
                }

                if (isVerified) {
                    resolve(user);
                } else {
                    const error = {
                        code: new HttpException('AUTH.ERRORS.SIGNIN.EMAIL_NOT_VERIFIED', HttpStatus.FORBIDDEN),
                        err: null,
                    };
                    reject(error);
                }
            } catch (error) {
                reject(error);
            }
        });
    }
}
