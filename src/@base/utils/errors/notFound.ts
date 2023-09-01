import { HttpStatus } from '@nestjs/common';

export const NOT_FOUND_ERROR = {
    code: HttpStatus.NOT_FOUND,
    message: 'ERRORS.NOT_FOUND',
};
