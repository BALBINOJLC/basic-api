import { Body, Post, UseGuards, Request, Get, Res, Query, Controller, Param, Req } from '@nestjs/common';
import { JwtAuthGuard, RequestHandlerUtil, RequestWithUser } from '@utils';
import { AuthService } from '../services';
import { ApiBasicAuth, ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { envs } from 'src/config/envs';
import { PasswordForgotDto, SignInTwoAuth, SignUpDto } from '../dtos';
import { Response } from 'express';

@ApiTags('AUTH')
@Controller({
    version: '1',
    path: 'auth',
})
export class AuthController {
    private CLIENT_URI: string;

    constructor(private _authService: AuthService) {
        this.CLIENT_URI = envs.node.client_uri;
    }

    @Post('signup/:invited/:sendemail')
    async signup(
        @Body() body: SignUpDto,
        @Param('invited') invited: boolean,
        @Param('sendemail') sendemail: boolean,
        @Res() res: Response
    ): Promise<Response> {
        return RequestHandlerUtil.handleRequest(() => this._authService.signUp(body, invited, sendemail), res, 201);
    }

    @Post('signin')
    @ApiBasicAuth()
    @ApiOperation({
        summary: 'Basic Auth',
        description: 'Sign In with email and password',
    })
    async signin(@Request() req: RequestWithUser, @Res() res: Response): Promise<Response> {
        try {
            const resp = await this._authService.signIn(req);
            return res.json(resp);
        } catch (error: unknown) {
            if (error instanceof Error) {
                return res.status((error as any).code?.status || 500).json(error);
            } else {
                return res.status(500).json(error);
            }
        }
    }

    @Post('signin/twoauth')
    @ApiBasicAuth()
    @ApiOperation({
        summary: 'Validate Code',
        description: 'Validate Code',
    })
    async signInTwoAuth(@Body() body: SignInTwoAuth, @Res() res: Response): Promise<Response> {
        try {
            const resp = await this._authService.signInTwoAuth(body.code, body.email);
            return res.json(resp);
        } catch (error: unknown) {
            if (error instanceof Error) {
                return res.status((error as any).code?.status || 500).json(error);
            } else {
                return res.status(500).json(error);
            }
        }
    }

    @Post('reset-password')
    @ApiOperation({
        summary: 'Reset Password',
        description: 'Reset Password',
    })
    async passwordresetToken(
        @Body() body: { password: { password: string } },
        @Query('token') token: string,

        @Res() res: Response
    ): Promise<Response> {
        const { password } = body;
        try {
            const resp = await this._authService.resetPassword(token, password.password);
            return res.json(resp);
        } catch (error: unknown) {
            if (error instanceof Error) {
                return res.status((error as any).code?.status || 500).json(error);
            } else {
                return res.status(500).json(error);
            }
        }
    }

    @Post('change-password')
    @ApiBasicAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        summary: 'Change Password',
        description: 'Change Password',
    })
    async changePassword(
        @Request() req: RequestWithUser,
        @Res() res: Response,
        @Body() body: { currentPassword: string; newPassword: string }
    ): Promise<Response> {
        try {
            const resp = await this._authService.changePassword(req, body.currentPassword, body.newPassword);
            return res.json(resp);
        } catch (error: unknown) {
            if (error instanceof Error) {
                return res.status((error as any).code?.status || 500).json(error);
            } else {
                return res.status(500).json(error);
            }
        }
    }

    @Post('check')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        summary: 'Check Token',
        description: 'Check if token is valid',
    })
    async checkToken(@Request() req: RequestWithUser, @Res() res: Response): Promise<Response> {
        try {
            const resp = await this._authService.checkToken(req);
            return res.json(resp);
        } catch (error: unknown) {
            if (error instanceof Error) {
                return res.status((error as any).code?.status || 500).json(error);
            } else {
                return res.status(500).json(error);
            }
        }
    }

    @Post('password/set')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async setNewPasswordAdmin(
        @Body() body: { email: string; password: string },
        @Res() res: Response,
        @Req() req: RequestWithUser
    ): Promise<Response> {
        const { email, password } = body;
        try {
            const { user } = req;
            if (user.role === 'SUPER_ADMIN') {
                const resp = await this._authService.setNewPasswordAdmin(email, password);
                return res.json(resp);
            } else {
                const error = { code: { status: 401, message: 'AUTH.UNAUTHORIZED' } };
                return res.status(401).json(error);
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                return res.status((error as any).code.status).json(error);
            } else {
                return res.status(500).json(error);
            }
        }
    }

    @Get('activateaccount/:token')
    @ApiParam({
        name: 'token',
        description: 'User Token',
        required: true,
    })
    @ApiOperation({
        summary: 'Activate Account',
        description: 'Activate Account',
    })
    async activateAccount(@Request() req: RequestWithUser, @Res() res: Response): Promise<void | Record<string, any>> {
        const { token } = req.params;
        try {
            await this._authService.activateAccount(token);
            return res.redirect(`${this.CLIENT_URI}/auth/sign-in`);
        } catch (error: unknown) {
            if (error instanceof Error) {
                return res.status((error as any).code?.status || 500).json(error);
            } else {
                return res.status(500).json(error);
            }
        }
    }

    @Get('activateaccountinvited/:token')
    @ApiParam({
        name: 'token',
        description: 'User Token',
        required: true,
    })
    @ApiOperation({
        summary: 'Activate Invited Account',
        description: 'Activate Invited Account',
    })
    async activateAccountInvited(@Request() req: RequestWithUser, @Res() res: Response): Promise<void | Record<string, any>> {
        const { token } = req.params;
        try {
            await this._authService.activateAccount(token);
            return res.redirect(`${this.CLIENT_URI}/auth/sign-in`);
        } catch (error: unknown) {
            if (error instanceof Error) {
                return res.status((error as any).code?.status || 500).json(error);
            } else {
                return res.status(500).json(error);
            }
        }
    }

    @Post('link/password')
    async passwordreset(@Body() body: PasswordForgotDto, @Res() res: Response): Promise<Response> {
        try {
            const resp = await this._authService.forgotPassword(body.email);
            return res.json(resp);
        } catch (error: unknown) {
            if (error instanceof Error) {
                return res.status((error as any).code.status).json(error);
            } else {
                return res.status(500).json(error);
            }
        }
    }
}
