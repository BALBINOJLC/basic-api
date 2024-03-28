export interface EnvVars {
    API_ENV: string;
    API_PORT: string;
    API_PREFIX: string;
    API_URI: string;
    CLIENT_URI: string;
    LOGGER_LEVEL: string;
    LOGGER_PRETTY_PRINT: string;
    JWT_KEY: string;
    DB_URL: string;
    DB_NAME: string;
}

export interface NodeEnv {
    env: EnvVars['API_ENV'];
    port: EnvVars['API_PORT'];
    prefix: EnvVars['API_PREFIX'];
    api_uri: EnvVars['API_URI'];
    client_uri: EnvVars['CLIENT_URI'];
    db_uri: EnvVars['DB_URL'];
    db_name: EnvVars['DB_NAME'];
}

export interface LoggerEnv {
    level: EnvVars['LOGGER_LEVEL'];
    pretty: EnvVars['LOGGER_PRETTY_PRINT'];
}

export interface JwtEnv {
    jxt_key: EnvVars['JWT_KEY'];
}

export interface Envs {
    node: NodeEnv;
    logger: LoggerEnv;
    jwt: JwtEnv;
}
