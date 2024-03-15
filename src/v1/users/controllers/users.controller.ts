import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, ParamsDto, RequestHandlerUtil, RequestWithUser } from '@utils';
import { UserCreateDto, UserFilterDto, UserUpdateDto } from '../dtos';
import { Response } from 'express';
import { UserService } from '../services';

@ApiTags('Users')
@Controller({
    version: '1',
    path: 'users',
})
export class UserController {
    constructor(private readonly _userService: UserService) {}

    @Get(':limit/:offset/:sort/:fields?')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        summary: 'Get All Users',
        description: 'Get a list of Users',
    })
    async findAll(
        @Param() params: ParamsDto,
        @Query() query: UserFilterDto,
        @Res() res: Response,
        @Req() req: RequestWithUser
    ): Promise<Response> {
        const { user } = req;
        if (user.role === 'USER') {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        if (user.role === 'ADMIN') {
            params.fields = 'first_name last_name email role phone display_name photo_url';
        }

        return RequestHandlerUtil.handleRequest(() => this._userService.findAll(query, params, user), res);
    }

    @Get('/search/:limit/:offset/:sort/:regexp/:fields?')
    @ApiOperation({
        summary: 'Search Users',
        description: 'Search for users based on regex patterns',
    })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async search(
        @Param() params: ParamsDto,
        @Param('regexp') regexp: string,
        @Query() query: UserFilterDto,
        @Req() req: RequestWithUser,
        @Res() res: Response
    ): Promise<Response> {
        const { user } = req;
        const regExp = new RegExp(regexp, 'i');
        return RequestHandlerUtil.handleRequest(() => this._userService.search(query, regExp, params, user), res);
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
        return RequestHandlerUtil.handleRequest(() => this._userService.findOne(query, fields), res);
    }

    @Post('create')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async signup(@Body() body: UserCreateDto, @Res() res: Response): Promise<Response> {
        return RequestHandlerUtil.handleRequest(() => this._userService.create(body), res);
    }

    @Put(':id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        summary: 'Update User',
        description: 'Update a User',
    })
    async update(
        @Body() body: UserUpdateDto,
        @Param('id') id: string,
        @Res() res: Response,
        @Req() req: RequestWithUser
    ): Promise<Response> {
        const { user } = req;
        return RequestHandlerUtil.handleRequest(() => this._userService.update(id, body, user._id, user.type), res);
    }

    @Put('/masive')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async updateMasive(@Body() body: UserUpdateDto, @Res() res: Response, @Req() req: RequestWithUser): Promise<Response> {
        const { user } = req;
        if (user.type === 'OWNER') {
            return RequestHandlerUtil.handleRequest(() => this._userService.updateMasive(body), res);
        } else {
            return res.status(401).json({ message: 'Unauthorized' });
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
        return RequestHandlerUtil.handleRequest(() => this._userService.delete(id), res);
    }
}
