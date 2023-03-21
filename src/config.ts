import { registerAs } from '@nestjs/config';
//TODO sacar gitignore
export default registerAs('config', () => {
    return {
        node: {
            env: process.env.NODE_ENV,
            port: process.env.PORT,
            prefix: process.env.APP_PREFIX,
            uri_backend: process.env.URI_BACKEND,
        },
        logger: {
            level: process.env.LOGGER_LEVEL,
            pretty: process.env.LOGGER_PRETTY_PRINT,
        },
        jwt: {
            jxt_key: process.env.JWT_KEY,
        },
        client: {
            uri_client: process.env.URI_FRONT,
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
