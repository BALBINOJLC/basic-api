import 'dotenv/config';
import * as Joi from 'joi';
import { EnvVars } from './envs.interface';

const eventsShema = Joi.object({
    API_ENV: Joi.string().valid('development', 'test', 'staging', 'production').default('development'),
    API_PORT: Joi.number().required(),
    API_PREFIX: Joi.string().required(),
    API_URI: Joi.string().required(),
    CLIENT_URI: Joi.string().required(),

    LOGGER_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug', 'log', 'silent').default('silent'),
    LOGGER_PRETTY_PRINT: Joi.boolean().default(true),

    JWT_KEY: Joi.string().required(),
});

const { error } = eventsShema.validate(process.env, { allowUnknown: true });

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

export const envVars: EnvVars = eventsShema.validate(process.env, { allowUnknown: true }).value as EnvVars;
