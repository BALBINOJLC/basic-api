export interface EnvVars {
    API_ENV: string;
    API_PORT: string;
    API_PREFIX: string;
    API_URI: string;
    CLIENT_URI: string;
    LOGGER_LEVEL: string;
    LOGGER_PRETTY_PRINT: string;
    JWT_KEY: string;
    SENDGRID_API_KEY: string;
    TEMPLATE_VERIFY_ACCOUNT: string;
    TEMPLATE_RESET_PASSWORD: string;
    TWILIO_ACCOUNT_SID: string;
    TWILIO_AUTH_TOKEN: string;
    TWILIO_PHONE_NUMBER: string;
}

export interface NodeEnv {
    env: EnvVars['API_ENV'];
    port: EnvVars['API_PORT'];
    prefix: EnvVars['API_PREFIX'];
    api_uri: EnvVars['API_URI'];
    client_uri: EnvVars['CLIENT_URI'];
}

export interface LoggerEnv {
    level: EnvVars['LOGGER_LEVEL'];
    pretty: EnvVars['LOGGER_PRETTY_PRINT'];
}

export interface JwtEnv {
    jxt_key: EnvVars['JWT_KEY'];
}

export interface SendgridTemplates {
    auth: {
        verify_account: EnvVars['TEMPLATE_VERIFY_ACCOUNT'];
        reset_password: EnvVars['TEMPLATE_RESET_PASSWORD'];
    };
}

export interface SendgridEnv {
    api_key: EnvVars['SENDGRID_API_KEY'];
    templates: SendgridTemplates;
}

export interface TwilioEnv {
    account_sid: EnvVars['TWILIO_ACCOUNT_SID'];
    auth_token: EnvVars['TWILIO_AUTH_TOKEN'];
    phone_number: EnvVars['TWILIO_PHONE_NUMBER'];
}

export interface Envs {
    node: NodeEnv;
    logger: LoggerEnv;
    jwt: JwtEnv;
    sendgrid: SendgridEnv;
    twilio: TwilioEnv;
}
