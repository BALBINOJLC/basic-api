/* eslint-disable @typescript-eslint/no-explicit-any */
import { Logger } from '@nestjs/common';
import { Errordata } from './error.dto';

export class CustomError extends Error {
    public statusCode: number;

    public message: string;

    public module: string;

    err: Error | null;

    logger: Logger;

    constructor({ message, statusCode, module, innerError }: Errordata) {
        super(message);
        this.statusCode = statusCode;
        this.err = innerError || null;
        // Mantener el stack trace del error original
        if (innerError && innerError.stack) {
            this.stack = innerError.stack;
        }

        this.logger = new Logger(module);
        this.logger.error(message, innerError);
    }
}
