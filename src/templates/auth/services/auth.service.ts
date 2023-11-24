/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable max-lines */
import { HttpException, HttpStatus, Inject, Injectable, Request } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserDocument, UserRolesEnum, UserService, UserTypesEnum } from '@users';
import { SignUpDto } from '../dtos';
import { RequestWithUser, generateUniqueRandomNumber, userjwt } from '@utils';

import axios from 'axios';

import { Twilio } from 'twilio';
import config from 'src/config';
import { ConfigType } from '@nestjs/config';
import { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message';
import { InjectModel } from '@nestjs/mongoose';
import { CodesDocument, CodesSchemaName } from '../schemas';

import { Model } from 'mongoose';
import { IActivateAccountSucces, IJwtUser, ISingInSucces, ISingUpSucces } from '../interfaces';

import * as admin from 'firebase-admin';
import * as fs from 'fs';
import { NetworksEnum } from '../enums';
import { EmailService } from '@email';

@Injectable()
export class AuthService {
    private client: Twilio;

    private phone_number = '+***********';

    constructor(
        private _userService: UserService,
        private jwtService: JwtService,
        @Inject(config.KEY) private configService: ConfigType<typeof config>,
        @InjectModel(CodesSchemaName)
        private readonly model: Model<CodesDocument>,
        private _emailService: EmailService
    ) {
        const accountSid = configService.twilio.account_sid;
        const authToken = configService.twilio.auth_token;

        this.client = new Twilio(accountSid, authToken);
        this.phone_number = configService.twilio.phone_number;

        // Inicializar la app de Firebase
        const serviceAccount = JSON.parse(fs.readFileSync('firebase-admin.json', 'utf8'));
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: 'https://arena-xp.firebaseio.com',
        });
    }

    async getCountry(ip: string): Promise<any> {
        try {
            const url = `https://ipinfo.io/${ip}/json`;

            const response = await axios({
                method: 'GET',
                url,
            });

            return response.data;
        } catch (error) {
            console.log('error user auth line 46', error);

            const errorCode = error.code;

            return {
                country: '',
                errorCode: errorCode,
            };
        }
    }

    async signUp(input: SignUpDto, invited: boolean, sendEmail: boolean): Promise<ISingUpSucces> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let userData: any = {
            ...input,
        };
        if (input.dni) {
            userData = {
                ...userData,
                rut: input.dni.replace(/[^\w\s]/gi, ''),
            };
        }

        return new Promise<ISingUpSucces>(async (resolve, reject) => {
            try {
                if (userData.socialToken) {
                    const datavalidation = await this.validateTokenGoogle(userData.socialToken);
                    if (datavalidation.isValid) {
                        userData = {
                            ...userData,
                            isActive: datavalidation.isValid,
                            emailVerify: datavalidation.isValid,
                            signInMethod: NetworksEnum.GOOGLE,
                            photoUrl: datavalidation.user.photoUrl,
                            role: userData.role || UserRolesEnum.USER,
                            type: userData.type || UserTypesEnum.CLIENT,
                        };

                        const userExists = await this._userService.validate({ email: userData.email });

                        if (userExists) {
                            userData = {
                                ...userData,
                                isActive: datavalidation.isValid,
                                emailVerify: datavalidation.isValid,
                                signInMethod: NetworksEnum.GOOGLE,
                            };
                            delete userData.photoUrl;
                            const user = await this._userService.update({ _id: String(userExists._id) }, userData, String(userExists._id));

                            const userJwt = userjwt(user.data);
                            const token = this.createJwtPayload(userJwt);
                            resolve({
                                userName: user.data.userName,
                                _id: user.data._id,
                                email: user.data.email,
                                accessToken: token.token,
                                user: user.data,
                                message: 'AUTH.SIGNIN_SUCCESS',
                            });
                        } else {
                            const user = await this._userService.create(userData);
                            const userJwt = userjwt(user);
                            const token = this.createJwtPayload(userJwt);
                            resolve({
                                userName: user.userName,
                                _id: user._id,
                                email: user.email,
                                accessToken: token.token,
                                user: user,
                                message: 'AUTH.SIGNIN_SUCCESS',
                            });
                            return;
                        }
                    }
                }
                const user = await this._userService.create(userData);

                const userJwt = userjwt(user);
                const token = this.createJwtPayload(userJwt);
                try {
                    if (sendEmail) {
                        // unhash user.password
                        await this._emailService.verifyAccount(token.token, user, invited);
                    }
                    resolve({
                        userName: user.userName,
                        email: user.email,
                        _id: user._id,
                        message: 'AUTH.SIGNUP_SUCCESS',
                    });
                } catch (error) {
                    reject(error);
                }
            } catch (error) {
                console.log('error', error);

                reject(error);
            }
        });
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
                            datavalidation = await this.validateTokenGoogle(socialToken);

                            if (datavalidation.isValid) {
                                const user = await this.validateUserSocial(email, datavalidation.isValid);
                                if (user && typeof user !== 'boolean') {
                                    const userUpdated = await this._userService.update(
                                        { _id: String(user._id) },
                                        {
                                            lastLogin: new Date(),
                                            isActive: datavalidation.isValid,
                                            emailVerify: datavalidation.isValid,
                                            signInMethod: netWork,
                                        },
                                        String(user._id)
                                    );
                                    const userJwt = userjwt(user);
                                    const jwt = this.createJwtPayload(userJwt);
                                    resolve({
                                        accessToken: jwt.token,
                                        user: userUpdated.data,
                                        message: 'AUTH.SIGNIN_SUCCESS',
                                    });
                                    return;
                                } else {
                                    const newUser = await this.signUp(datavalidation.user, false, false);
                                    const userLogged = await this._userService.update(
                                        { _id: String(newUser._id) },
                                        {
                                            lastLogin: new Date(),
                                        },
                                        String(newUser._id)
                                    );
                                    const userJwt = userjwt(userLogged.data);
                                    const jwt = this.createJwtPayload(userJwt);
                                    resolve({
                                        accessToken: jwt.token,
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
                await this._userService.update({ _id: String(user._id) }, { lastLogin: new Date() }, String(user._id));

                const userJwt = userjwt(user);
                const jwt = this.createJwtPayload(userJwt);
                resolve({
                    accessToken: jwt.token,
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
                    const validateCode = await this.model.findOne({ code, email, isDeleted: false });
                    console.log('validateCode', validateCode);
                    if (validateCode) {
                        await this._userService.update({ _id: String(user._id) }, { lastLogin: new Date() }, String(user._id));
                        const userJwt = userjwt(user);

                        const jwt = this.createJwtPayload(userJwt);
                        await this.model.findByIdAndUpdate(String(validateCode._id), {
                            isDeleted: true,
                            deletedAt: new Date(),
                            code: `${validateCode.code}-isDeleted-${new Date().getTime()}`,
                        });
                        resolve({
                            accessToken: jwt.token,
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
                const user = (await this._userService.findOne({ email }, 'email userName role type')) as unknown as UserDocument;
                if (user) {
                    try {
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

    async validateUser(email: string, password: string): Promise<UserDocument> {
        return new Promise<UserDocument>(async (resolve, reject) => {
            try {
                const user = await this._userService.findOne({ email });

                if (!user) {
                    const error = {
                        code: new HttpException('AUTH.ERRORS.SIGNIN', HttpStatus.BAD_REQUEST),
                        err: null,
                    };
                    reject(error);
                } else if (!user.emailVerify) {
                    const error = {
                        code: new HttpException('AUTH.ERRORS.SIGNIN.EMAIL_NOT_VERIFIED', HttpStatus.FORBIDDEN),
                        err: null,
                    };
                    reject(error);
                } else if (!user.isActive) {
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
                    user.isActive = true;
                    user.emailVerify = true;

                    await user.save();
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
                console.log('password', password);

                const payload = this.jwtService.verify(token);
                const user = await this._userService.findOne({ email: payload.email });
                if (user) {
                    await user.save();
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

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async changePassword(@Request() req, currentPassword: string, newPassword: string): Promise<{ message: string }> {
        console.log('escambio');
        return new Promise<{ message: string }>(async (resolve, reject) => {
            try {
                const email = req.user.email;

                const validateUser = await this.validateUser(email, currentPassword);
                await this.validateSamePassword(newPassword, validateUser.password);
                await this._userService.update({ email }, { password: newPassword }, String(validateUser._id));
                resolve({ message: 'AUTH.SUCCESS.PASSWORD.UPDATED' });
            } catch (err) {
                reject(err);
            }
        });
    }

    async setNewPasswordAdmin(email: string, passwrod: string): Promise<{ message: string }> {
        return new Promise<{ message: string }>(async (resolve, reject) => {
            try {
                const user = await this._userService.findOne({ email }, 'email userName role type');
                if (user) {
                    const newPassword = await bcrypt.hash(passwrod.toString(), 10);
                    user.password = newPassword;
                    await user.save();
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

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public createJwtPayload(data: IJwtUser): { expiresIn: number; token: string } {
        try {
            const jwt = this.jwtService.sign(data);

            return {
                expiresIn: 3600 * 60 * 60 * 24,
                token: jwt,
            };
        } catch (error) {
            console.dir(error, { depth: null });

            throw error;
        }
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
        return new Promise<UserDocument | boolean>(async (resolve, reject) => {
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

    private async validateTokenGoogle(token: string): Promise<{ isValid: boolean; user }> {
        try {
            const decodedToken = await admin.auth().verifyIdToken(token);
            const user = {
                email: decodedToken.email,
                emailVerify: decodedToken.email_verified,
                isActive: decodedToken.email_verified,
                firstName: decodedToken.name.split(' ')[0],
                lastName: decodedToken.name.split(' ')[1],
                password: new Date().getTime().toString(),
                photoUrl: null,
                socialToken: token,
            };
            if (decodedToken.picture) {
                user.photoUrl = {
                    url: decodedToken.picture,
                    name: decodedToken.name.split(' ')[0],
                    color: '#000000',
                    charter: decodedToken.name.charAt(0).toUpperCase(),
                };
            }
            const { email_verified } = decodedToken;
            if (email_verified) {
                return {
                    isValid: true,
                    user,
                };
            } else {
                return {
                    isValid: false,
                    user,
                };
            }

            // Token is valid, continue with your code logic here
        } catch (error) {
            console.error('Error occurred:', error);
            if (error.code === 'auth/invalid-id-token') {
                console.error('The provided ID token is not a valid Firebase ID token.');
                // Handle the invalid ID token error here
            }
        }
    }
}
