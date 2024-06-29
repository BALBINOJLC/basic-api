import { envVars } from './envs.validations';

export const envs = {
    node: {
        env: envVars.API_ENV,
        port: envVars.API_PORT,
        prefix: envVars.API_PREFIX,
        api_uri: envVars.API_URI,
        client_uri: envVars.CLIENT_URI,
        db_uri: envVars.DATABASE_URL,
    },

    jwt: {
        jxt_key: process.env.JWT_KEY,
    },

    twilio: {
        account_sid: process.env.TWILIO_ACCOUNT_SID,
        auth_token: process.env.TWILIO_AUTH_TOKEN,
        twilio_phone: process.env.TWILIO_PHONE,
    },

    brevo: {
        api_key: process.env.BV_API_KEY,
        templates: {
            auth: {
                verify_account: process.env.BV_VERIFY_ACCOUNT,
                reset_password: process.env.BV_RESET_PASSWORD,
            },
        },
    },
};
