/* eslint-disable @typescript-eslint/no-explicit-any */
// utils/request-handler.util.ts
import { HttpException, Injectable } from '@nestjs/common';
import { Response } from 'express';
import { CustomError } from '../errors/error.class';

// Asumiendo que CustomError está correctamente definido en otro lugar
@Injectable()
export class RequestHandlerUtil {
    static async handleRequest(
        action: () => Promise<any>,
        res: Response,
        statusCode?: number,
        responseModifier?: (res: Response, result: any) => void
    ): Promise<Response<any>> {
        try {
            const result = await action();
            if (responseModifier) {
                responseModifier(res, result);
                return res; // Al modificar la respuesta directamente, el tipo de retorno se vuelve explícito
            } else {
                return res.json(result);
            }
        } catch (error: unknown) {
            if (error instanceof HttpException) {
                // Manejar como HttpException
                return res.status(error.getStatus()).json({ message: error.getResponse() });
            } else if (error instanceof CustomError) {
                // Manejar como CustomError
                return res.status(error.statusCode).json({ message: error.message, details: error.err?.message });
            } else if (error instanceof Error) {
                // Manejar como Error genérico
                return res.status(statusCode || 500).json({ message: error.message });
            } else {
                // Manejar errores inesperados que no son instancias de Error
                return res.status(statusCode || 500).json({ message: 'API_ERRORS_UNEXPECTED' });
            }
        }
    }
}
