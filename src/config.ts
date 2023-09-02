import { registerAs } from '@nestjs/config';
//TODO sacar gitignore
export default registerAs('config', () => {
    return {
        node: {
            env: process.env.API_ENV,
            port: process.env.API_PORT,
            prefix: process.env.API_PREFIX,
            api_uri: process.env.API_URI,
            uri_client: process.env.URI_CLIENT,
        },

        logger: {
            level: process.env.LOGGER_LEVEL,
            pretty: process.env.LOGGER_PRETTY_PRINT,
        },

        jwt: {
            jxt_key: process.env.JWT_KEY,
        },

        sendgrid: {
            api_key: process.env.SENDGRID_API_KEY,
            templates: {
                auth: {
                    verify_account: process.env.TEMPLATE_VERIFY_ACCOUNT,
                    reset_password: process.env.TEMPLATE_RESET_PASSWORD,
                },
            },
        },
    };
});
