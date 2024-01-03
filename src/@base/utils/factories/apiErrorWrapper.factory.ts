import { ApiProperty } from '@nestjs/swagger';
import { Type } from '@nestjs/common';
import { ErrorResponseDto } from '../errors/error.dto';

export function apiErrorWrapper(type: Type): undefined | Type {
    class ResponseWrapper {
        @ApiProperty({ type })
        public error: ErrorResponseDto;
    }

    Object.defineProperty(ResponseWrapper, 'name', {
        value: `ResponseWrapperFor${type.name}`,
    });

    return ResponseWrapper;
}
