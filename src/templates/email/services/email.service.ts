import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import * as SendGrid from '@sendgrid/mail';
import config from 'src/config';
import { ISenderSendgrid, ISendgridTemplates } from '../interfaces';
import { UserDocument } from '@users';
import { IJwtUser } from '@auth';

@Injectable()
export class EmailService {
    templates: ISendgridTemplates;

    public CLIENT_URI: string;

    public URI_BACK: string;

    public sender: ISenderSendgrid;

    adminEmails: string[];

    constructor(@Inject(config.KEY) private configService: ConfigType<typeof config>) {
        this.templates = {
            SG_TP_VERIFY_ACCOUNT: String(this.configService.sendgrid.templates.auth.verify_account),
            SG_TP_INVITE_USER: String(this.configService.sendgrid.templates.auth.verify_account),
            SG_TP_RESET_PASSWORD: String(this.configService.sendgrid.templates.auth.reset_password),
        };
        this.sender = {
            senderEmail: 'hola@sicrux.com',
            senderName: 'Refashion',
        };

        this.adminEmails = ['msanz@sicrux.tech'];
    }

    async addNewsLetter(email: string): Promise<unknown> {
        return new Promise(async (resolve, reject) => {
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
                resolve(sendEmail);
            } catch (err) {
                const error = {
                    code: new HttpException('EMAIL.ERRORS.SEND.NEWS_LETTER', HttpStatus.BAD_REQUEST),
                    err,
                };
                reject(error);
            }
        });
    }

    async verifyAccount(token: string, user: UserDocument, invited: boolean): Promise<unknown> {
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
                    userName: user.userName,
                    link,
                },
            };
            try {
                const sendEmail = await SendGrid.send(msg);
                resolve(sendEmail);
            } catch (err) {
                const error = {
                    code: new HttpException('EMAIL.ERRORS.SEND.VERIFY_ACCOUNT', HttpStatus.BAD_REQUEST),
                    err,
                };
                console.log(error);
                resolve(false);
            }
        });
    }

    async forgotPassword(token: string, user: UserDocument): Promise<unknown> {
        return new Promise(async (resolve, reject) => {
            const link = `${this.CLIENT_URI}/auth/reset-password/${token}`;
            const msg = {
                to: user.email,
                from: {
                    name: this.sender.senderName,
                    email: this.sender.senderEmail,
                },
                templateId: this.templates.SG_TP_RESET_PASSWORD,

                dynamic_template_data: {
                    userName: user.userName,
                    link,
                },
            };
            try {
                const sendEmail = await SendGrid.send(msg);
                resolve(sendEmail);
            } catch (err) {
                const error = {
                    code: new HttpException('EMAIL.ERRORS.SEND.RESET_PASSWORD', HttpStatus.BAD_REQUEST),
                    err,
                };
                reject(error);
            }
        });
    }

    async newMessage(message: string, name: string, email: string): Promise<unknown> {
        return new Promise(async (resolve, reject) => {
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
                resolve(sendEmail);
            } catch (err) {
                const error = {
                    code: new HttpException('EMAIL.ERRORS.SEND.NEW_MESSAGE', HttpStatus.BAD_REQUEST),
                    err,
                };
                console.log(err);

                reject(error);
            }
        });
    }

    async inviteUser(token: string, user: UserDocument, owner: IJwtUser): Promise<unknown> {
        return new Promise(async (resolve, reject) => {
            const link = `${this.CLIENT_URI}/auth/invite/${token}`;
            const msg = {
                to: user.email,
                from: {
                    name: this.sender.senderName,
                    email: this.sender.senderEmail,
                    ownerName: owner.displayName,
                },
                templateId: this.templates.SG_TP_INVITE_USER,

                dynamic_template_data: {
                    userName: user.userName,
                    link,
                },
            };
            try {
                const sendEmail = await SendGrid.send(msg);
                resolve(sendEmail);
            } catch (err) {
                const error = {
                    code: new HttpException('EMAIL.ERRORS.SEND.INVITE_USER', HttpStatus.BAD_REQUEST),
                    err,
                };
                reject(error);
            }
        });
    }
}
