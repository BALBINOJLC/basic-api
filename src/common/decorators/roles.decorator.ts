import { CustomDecorator, SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Roles = (...roles: any[]): CustomDecorator<string> => SetMetadata(ROLES_KEY, roles);
