import { HttpStatus, Injectable } from '@nestjs/common';

import * as SendGrid from '@sendgrid/mail';
import { envs } from 'src/config/envs';
import { ISenderSendgrid, ISendgridTemplates } from '../interfaces';
import { IUser, UserDocument } from '@users';
import { IJwtUser } from '@auth';
import { CustomError } from '@utils';

@Injectable()
export class EmailService {
    templates: ISendgridTemplates;

    public CLIENT_URI: string;

    public URI_BACK: string;

    public sender: ISenderSendgrid;

    adminEmails: string[];

    constructor() {
        SendGrid.setApiKey(String(envs.sendgrid.api_key));
        this.templates = {
            SG_TP_VERIFY_ACCOUNT: String(envs.sendgrid.templates.auth.verify_account),
            SG_TP_INVITE_USER: String(envs.sendgrid.templates.auth.verify_account),
            SG_TP_RESET_PASSWORD: String(envs.sendgrid.templates.auth.reset_password),
        };
        this.CLIENT_URI = envs.node.client_uri;
        this.sender = {
            senderEmail: 'hola@sicrux.com',
            senderName: 'Sicrux',
        };

        this.adminEmails = ['msanz@sicrux.tech'];
    }

    async addNewsLetter(email: string): Promise<unknown> {
        const msg = {
            to: 's33yfbt3@robot.zapier.com',
            cco: ['msanz@gux.tech', 'hello@refashion.cl'],
            subject: 'New Newsletter',
            from: {
                name: this.sender.senderName,
                email: this.sender.senderEmail,
            },
            html: `email: ${email}`,
        };
        try {
            const sendEmail = await SendGrid.send(msg);
            return sendEmail;
        } catch (err) {
            throw new CustomError({
                message: 'EMAIL.ERRORS.SEND.NEWS_LETTER',
                statusCode: HttpStatus.BAD_REQUEST,
                module: this.constructor.name,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                innerError: err,
            });
        }
    }

    async verifyAccount(token: string, user: IUser, invited: boolean): Promise<unknown> {
        return new Promise(async (resolve) => {
            let link = '';
            if (!invited) {
                link = `${this.URI_BACK}/auth/activateaccount/${token}`;
            } else {
                link = `${this.URI_BACK}/auth/activateaccountinvited/${token}`;
            }
            const msg = {
                to: user.email,
                from: {
                    name: this.sender.senderName,
                    email: this.sender.senderEmail,
                },

                templateId: this.templates.SG_TP_VERIFY_ACCOUNT,

                dynamic_template_data: {
                    user_name: user.user_name,
                    link,
                },
            };
            try {
                const sendEmail = await SendGrid.send(msg);
                resolve(sendEmail);
            } catch (err) {
                throw new CustomError({
                    message: 'EMAIL.ERRORS.SEND.VERIFY_ACCOUNT',
                    statusCode: HttpStatus.BAD_REQUEST,
                    module: this.constructor.name,
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    innerError: err,
                });
            }
        });
    }

    async forgotPassword(token: string, user: UserDocument): Promise<unknown> {
        const link = `${this.CLIENT_URI}/auth/reset-password/${token}`;
        const msg = {
            to: user.email,
            from: {
                name: this.sender.senderName,
                email: this.sender.senderEmail,
            },
            templateId: this.templates.SG_TP_RESET_PASSWORD,

            dynamic_template_data: {
                user_name: user.user_name,
                link,
            },
        };
        try {
            const sendEmail = await SendGrid.send(msg);
            return sendEmail;
        } catch (err) {
            throw new CustomError({
                message: 'EMAIL.ERRORS.SEND.RESET_PASSWORD',
                statusCode: HttpStatus.BAD_REQUEST,
                module: this.constructor.name,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                innerError: err,
            });
        }
    }

    async newMessage(message: string, name: string, email: string): Promise<unknown> {
        const msg = {
            to: this.adminEmails,
            from: {
                name: this.sender.senderName,
                email: this.sender.senderEmail,
            },
            subject: 'Nuevo Mensaje desde la Web',
            html: `<p>Nombre: ${name}</p><p>Email: ${email}</p><p>Mensaje: ${message}</p>`,

            dynamic_template_data: {
                message: message,
                name: name,
                email: email,
            },
        };
        try {
            const sendEmail = await SendGrid.send(msg);
            return sendEmail;
        } catch (err) {
            throw new CustomError({
                message: 'EMAIL.ERRORS.SEND.NEW_MESSAGE',
                statusCode: HttpStatus.BAD_REQUEST,
                module: this.constructor.name,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                innerError: err,
            });
        }
    }

    async inviteUser(token: string, user: IUser, owner: IJwtUser): Promise<unknown> {
        const link = `${this.CLIENT_URI}/auth/invite/${token}`;
        const msg = {
            to: user.email,
            from: {
                name: this.sender.senderName,
                email: this.sender.senderEmail,
                ownerName: owner.display_name,
            },
            templateId: this.templates.SG_TP_INVITE_USER,

            dynamic_template_data: {
                user_name: user.user_name,
                link,
            },
        };
        try {
            const sendEmail = await SendGrid.send(msg);
            return sendEmail;
        } catch (err) {
            throw new CustomError({
                message: 'EMAIL.ERRORS.SEND.INVITE_USER',
                statusCode: HttpStatus.BAD_REQUEST,
                module: this.constructor.name,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                innerError: err,
            });
        }
    }
}
