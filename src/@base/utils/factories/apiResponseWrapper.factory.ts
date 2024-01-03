import { ApiProperty } from '@nestjs/swagger';
import { Type } from '@nestjs/common';

export function apiResponseWrapper(type: Type): undefined | Type {
    class ResponseWrapper {
        @ApiProperty({ type })
        public data: Type;
    }

    Object.defineProperty(ResponseWrapper, 'name', {
        value: `ResponseWrapperFor${type.name}`,
    });

    return ResponseWrapper;
}
