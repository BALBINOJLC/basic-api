import { ApiTags } from '@nestjs/swagger';
import { PasswordForgotDtoBase, SignUpDtoBase } from '@modules';

@ApiTags('SignUp Dto')
export class SignUpDto extends SignUpDtoBase {}

export class PasswordForgotDto extends PasswordForgotDtoBase {}
