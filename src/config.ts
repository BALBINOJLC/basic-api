import { registerAs } from '@nestjs/config';
//TODO sacar gitignore
export default registerAs('config', () => {
    return {
        dataBase: {
            uri: process.env.MONGO_URL,
            dbName: process.env.DB_NAME,
        },
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
        transbank: {
            oneclick: {
                api_key_one_clic: process.env.API_KEY_ONE_CLICK,
                ecommerce_code_mall: process.env.ECOMMERCE_CODE_ONECLICK_MALL,
                ecommerce_code_shop: process.env.ECOMMERCE_CODE_ONECLICK_SHOP,
            },
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
        aws: {
            access_key_id: process.env.AWS_ACCESS_KEY_ID,
            secret_access_key: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION,
            bucket: process.env.AWS_BUCKET,
        },
    };
});
