import 'dotenv/config';
import * as Joi from 'joi';
import { IEnvVars } from './envs.interface';

const eventsShema = Joi.object({
    API_ENV: Joi.string().valid('development', 'test', 'staging', 'production').default('development'),
    API_PORT: Joi.number().required(),
    API_PREFIX: Joi.string().required(),
    API_URI: Joi.string().required(),
    CLIENT_URI: Joi.string().required(),
    JWT_KEY: Joi.string().required(),
    DB_URL: Joi.string().required(),
    DB_NAME: Joi.string().required(),
});

const { error } = eventsShema.validate(process.env, { allowUnknown: true });

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

export const envVars: IEnvVars = eventsShema.validate(process.env, { allowUnknown: true }).value as IEnvVars;
