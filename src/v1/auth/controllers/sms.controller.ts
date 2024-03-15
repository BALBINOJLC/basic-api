import { Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Twilio } from 'twilio';

@ApiTags('AUTH')
@Controller({
    version: '1',
    path: 'messages',
})
export class MessagesController {
    private client: Twilio;

    constructor() {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        this.client = new Twilio(accountSid, authToken);
    }

    @Post()
    sendMessage(): { message: string } {
        this.client.messages
            .create({
                body: 'This is the ship that made the Kessel Run in fourteen parsecs?',
                from: '+18145264997',
                to: '+56961078279',
            })
            .then((message) => console.log(message.sid));

        return { message: 'Message sent' };
    }
}
