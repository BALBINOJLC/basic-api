import { Body, Controller, Delete, Get, Param, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, ParamsDto, RequestWithUser } from '@utils';
import { UserFilterDto, UserUpdateDto } from '../dtos';
import { UserService } from '../services';
import { Response } from 'express';

@ApiTags('Users')
@Controller({
    version: '1',
    path: 'users',
})
export class UserController {
    constructor(private readonly _userService: UserService) {}

    @Get('validate/:userName')
    @ApiOperation({
        summary: 'Get Single User',
        description: 'Get a single User by userName',
    })
    async validate(@Param('userName') userName: string, @Res() res: Response): Promise<Response> {
        try {
            const resp = await this._userService.validate({ userName });
            return res.json(resp);
        } catch (error: unknown) {
            return res.status((error as any).code?.status || 500).json(error);
        }
    }

    @Get('validate-email/:email')
    @ApiOperation({
        summary: 'Get Single User',
        description: 'Get a single User by email',
    })
    async validateEmail(@Param('email') email: string, @Res() res: Response): Promise<Response> {
        try {
            const resp = await this._userService.validate({ email });
            return res.json(resp);
        } catch (error: unknown) {
            return res.status((error as any).code?.status || 500).json(error);
        }
    }

    @Get(':limit/:offset/:sort/:fields?')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        summary: 'Get All Users',
        description: 'Get a list of Users',
    })
    async findAll(@Param() params: ParamsDto, @Query() query: UserFilterDto, @Res() res: Response): Promise<Response> {
        try {
            const resp = await this._userService.findAll(query, params);
            return res.json(resp);
        } catch (error: unknown) {
            return res.status((error as any).code?.status || 500).json(error);
        }
    }

    @Get('/search/:limit/:offset/:sort/:regexp/:fields?')
    @ApiOperation({})
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async search(
        @Param() params: ParamsDto,
        @Param('regexp') regexp: string,
        @Query() query: UserFilterDto,
        @Res() res: Response
    ): Promise<Response> {
        try {
            const regExp = new RegExp(regexp, 'i');

            const resp = await this._userService.search(query, regExp, params);
            return res.json(resp);
        } catch (error: unknown) {
            return res.status((error as any).code?.status || 500).json(error);
        }
    }

    @Get(':fields?')
    @ApiParam({
        name: 'fields',
        required: true,
        type: String,
        description: 'Fields to return',
        example: 'name,lastname,age,address',
    })
    @ApiOperation({
        summary: 'Get Single User',
        description: 'Get a single User by id',
    })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async findOne(@Query() query: UserFilterDto, @Param('fields') fields: string, @Res() res: Response): Promise<Response> {
        try {
            const resp = await this._userService.findOne(query, fields);
            return res.json(resp);
        } catch (error: unknown) {
            return res.status((error as any).code?.status || 500).json(error);
        }
    }

    @Put()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        summary: 'Update User',
        description: 'Update a User',
    })
    async update(
        @Body() body: UserUpdateDto,
        @Query() query: UserFilterDto,
        @Res() res: Response,
        @Req() req: RequestWithUser
    ): Promise<Response> {
        try {
            const { user } = req;
            const resp = await this._userService.update(query, body, user._id, user.type);
            return res.json(resp);
        } catch (error: unknown) {
            return res.status((error as any).code?.status || 500).json(error);
        }
    }

    @Put('/masive')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async updateMasive(@Body() body: UserUpdateDto, @Res() res: Response, @Req() req: RequestWithUser): Promise<Response> {
        try {
            const { user } = req;
            if (user.type === 'OWNER') {
                const resp = await this._userService.updateMasive(body);
                return res.json(resp);
            } else {
                return res.status(401).json({ message: 'Unauthorized' });
            }
        } catch (error: unknown) {
            return res.status((error as any).code?.status || 500).json(error);
        }
    }

    @Delete(':id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        summary: 'Delete User',
        description: 'Delete a User',
    })
    async delete(@Param('id') id: string, @Res() res: Response): Promise<Response> {
        try {
            const resp = await this._userService.delete(id);
            return res.json(resp);
        } catch (error: unknown) {
            return res.status((error as any).code?.status || 500).json(error);
        }
    }
}
