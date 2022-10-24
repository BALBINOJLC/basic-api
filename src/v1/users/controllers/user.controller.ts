import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserControllerBase } from '@modules';
import { UserService } from '../services';

@ApiTags('Users')
@Controller({
    version: '1',
    path: 'users',
})
export class UserController extends UserControllerBase {
    constructor(private readonly _userService: UserService) {
        super(_userService);
    }
}
