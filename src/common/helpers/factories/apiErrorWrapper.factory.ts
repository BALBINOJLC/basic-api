/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiProperty } from '@nestjs/swagger';
import { Type } from '@nestjs/common';
import { ErrorResponseDto } from '@common';

export function apiErrorWrapper(type: Type): any {
    class ResponseWrapper {
        @ApiProperty({ type })
        public error: ErrorResponseDto;
    }

    Object.defineProperty(ResponseWrapper, 'name', {
        value: `ResponseWrapperFor${type.name}`,
    });

    return ResponseWrapper;
}
