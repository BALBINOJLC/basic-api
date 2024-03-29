import { SignUpDto } from '../dtos';

import * as admin from 'firebase-admin';
import { NetworksEnum } from '../enums';
import { DecodedToken, ISingUpSucces, ISocialUser, ValidationResult } from '../interfaces';
import { IUser, UserCreateDto, UserRolesEnum, UserService, UserTypesEnum } from '@users';
import { CommonAuthServise } from './comom.auth.service';
import { JwtService } from '@nestjs/jwt';
import { userjwt } from '@helpers';

export class SocialAuthService {
    fComomnAuth = new CommonAuthServise(this.jwtService);

    constructor(
        private _userService: UserService,
        private jwtService: JwtService
    ) {}

    async validateUserGoogle(input: SignUpDto): Promise<ISocialUser> {
        return new Promise(async (resolve, reject) => {
            try {
                const datavalidation = await this.validateTokenGoogle(input.socialToken);
                if (datavalidation.isValid) {
                    const userData: ISocialUser = {
                        is_active: datavalidation.isValid,
                        email_verify: datavalidation.isValid,
                        sign_in_method: NetworksEnum.GOOGLE,
                        photo_url: {
                            url: datavalidation.user.photo_url.url,
                            name: datavalidation.user.first_name,
                            color: '#000000',
                            charter: datavalidation.user.first_name.charAt(0).toUpperCase(),
                        },
                    };

                    resolve(userData);
                } else {
                    const error = {
                        message: 'AUTH.GOOGLE.INVALID_TOKEN',
                        err: null,
                    };
                    reject(error);
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    async validateTokenGoogle(token: string): Promise<ValidationResult> {
        try {
            const decodedToken = (await admin.auth().verifyIdToken(token)) as unknown as DecodedToken;
            const user = this.createUser(decodedToken, token) as IUser;
            return {
                isValid: decodedToken.email_verified,
                user,
            };
        } catch (error) {
            console.error('Error occurred:', error);
            this.handleError(error);
            throw error;
        }
    }

    private createUser(decodedToken: DecodedToken, token: string): Partial<IUser> {
        const names = decodedToken.name.split(' ');
        const user: Partial<IUser> = {
            email: decodedToken.email,
            email_verify: decodedToken.email_verified,
            is_active: decodedToken.email_verified,
            first_name: names[0],
            last_name: names.length > 1 ? names[1] : '',
            password: new Date().getTime().toString(),
            photo_url: null,
            socialToken: token,
            display_name: decodedToken.name,
        };
        if (decodedToken.picture) {
            user.photo_url = {
                url: decodedToken.picture,
                name: names[0],
                color: '#000000',
                charter: decodedToken.name.charAt(0).toUpperCase(),
            };
        }
        return user;
    }

    private handleError(error: any): void {
        console.error('Error occurred:', error);
        if (error.code === 'auth/invalid-id-token') {
            console.error('The provided ID token is not a valid Firebase ID token.');
        }
    }

    signUpUserGoogle(input: SignUpDto): Promise<ISingUpSucces> {
        return new Promise<ISingUpSucces>(async (resolve, reject) => {
            try {
                const userGoogle = await this.validateUserGoogle(input);

                const userData: UserCreateDto = {
                    ...userGoogle,
                    ...input,
                    role: input.role || UserRolesEnum.USER,
                    type: input.type || UserTypesEnum.ORG,
                };

                const userExists = await this._userService.validate({ email: userData.email });

                if (userExists) {
                    delete userData.photo_url;
                    const user = await this._userService.update(String(userExists._id), userData, String(userExists._id));
                    const userJwt = userjwt(user.data);
                    const token = this.fComomnAuth.createJwtPayload(userJwt);
                    resolve({
                        user_name: user.data.user_name,
                        _id: user.data._id,
                        email: user.data.email,
                        access_token: token.token,
                        user: user.data,
                        message: 'AUTH.SIGNIN_SUCCESS',
                    });
                } else {
                    const user = await this._userService.create(userData);
                    const userJwt = userjwt(user);
                    const token = this.fComomnAuth.createJwtPayload(userJwt);
                    resolve({
                        user_name: user.user_name,
                        _id: user._id,
                        email: user.email,
                        access_token: token.token,
                        user: user,
                        message: 'AUTH.SIGNIN_SUCCESS',
                    });
                    return;
                }
            } catch (error) {
                reject(error);
            }
        });
    }
}
