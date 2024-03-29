import { Request } from '@nestjs/common';

export declare type RequestHandler = typeof Request & { user };
