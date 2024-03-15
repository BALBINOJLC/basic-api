import { SignUpDto } from '../dtos';

import * as admin from 'firebase-admin';
import { NetworksEnum } from '../enums';
import { ISingUpSucces, ISocialUser } from '../interfaces';
import { userjwt } from '@base';
import { UserCreateDto, UserRolesEnum, UserService, UserTypesEnum } from '@users';
import { CommonAuthServise } from './comom.auth.service';
import { JwtService } from '@nestjs/jwt';

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

    async validateTokenGoogle(token: string): Promise<{ isValid: boolean; user }> {
        try {
            const decodedToken = await admin.auth().verifyIdToken(token);
            const user = {
                email: decodedToken.email,
                email_verify: decodedToken.email_verified,
                is_active: decodedToken.email_verified,
                first_name: decodedToken.name.split(' ')[0],
                last_name: decodedToken.name.split(' ')[1],
                password: new Date().getTime().toString(),
                photo_url: null,
                socialToken: token,
            };
            if (decodedToken.picture) {
                user.photo_url = {
                    url: decodedToken.picture,
                    name: decodedToken.name.split(' ')[0],
                    color: '#000000',
                    charter: decodedToken.name.charAt(0).toUpperCase(),
                };
            }
            const { email_verified: emailVerified } = decodedToken;
            if (emailVerified) {
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
                    const user = await this._userService.update({ _id: String(userExists._id) }, userData, String(userExists._id));
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
