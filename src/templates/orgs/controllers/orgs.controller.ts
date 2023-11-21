import { Body, Controller, Delete, Get, Param, Post, Put, Query, Res, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, ParamsDto, RequestWithUser } from '@utils';
import { CreateOrganizationDto, UpdateOrganizationsDto, FilterOrganizationsDto } from '../dtos';
import { OrganizationsService } from '../services';
import { Response } from 'express';

@ApiTags('Organizations')
@Controller({
    path: 'orgs',
    version: '1',
})
export class OrganizationsController {
    constructor(private readonly _organizationsService: OrganizationsService) {}

    @Get(':limit/:offset/:sort/:fields?')
    @ApiParam({
        name: 'fields',
        required: true,
        description: 'If not send fields need send white space',
    })
    @ApiOperation({})
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async findAll(@Param() params: ParamsDto, @Query() query: FilterOrganizationsDto, @Res() res: Response): Promise<Response> {
        try {
            const resp = await this._organizationsService.findAll(query, params);
            return res.json(resp);
        } catch (error: unknown) {
            if (error instanceof Error) {
                return res.status((error as any).code?.status || 500).json(error);
            } else {
                return res.status(500).json(error);
            }
        }
    }

    @Get(':fields?')
    @ApiParam({
        name: 'fields',
        required: true,
        description: 'If not send fields need send white space',
    })
    @ApiOperation({})
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async findOne(@Query() query: FilterOrganizationsDto, @Param('fields') fields: string, @Res() res: Response): Promise<Response> {
        try {
            const resp = await this._organizationsService.findOne(query, fields);
            return res.json(resp);
        } catch (error: unknown) {
            if (error instanceof Error) {
                return res.status((error as any).code?.status || 500).json(error);
            } else {
                return res.status(500).json(error);
            }
        }
    }

    @Post()
    @ApiOperation({})
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async create(@Body() payload: CreateOrganizationDto, @Res() res: Response, @Req() req: RequestWithUser): Promise<Response> {
        try {
            const userId = req.user._id;
            const resp = await this._organizationsService.create(payload, userId);
            return res.json(resp);
        } catch (error: unknown) {
            if (error instanceof Error) {
                return res.status((error as any).code?.status || 500).json(error);
            } else {
                return res.status(500).json(error);
            }
        }
    }

    @Put()
    @ApiOperation({})
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async update(
        @Body() body: UpdateOrganizationsDto,
        @Query() query: FilterOrganizationsDto,
        @Res() res: Response,
        @Req() req: RequestWithUser
    ): Promise<Response> {
        try {
            const userId = req.user._id;
            const resp = await this._organizationsService.update(query, body, userId);
            return res.json(resp);
        } catch (error: unknown) {
            if (error instanceof Error) {
                return res.status((error as any).code?.status || 500).json(error);
            } else {
                return res.status(500).json(error);
            }
        }
    }

    @Delete(':id')
    @ApiParam({
        name: 'id',
        required: true,
        description: 'ID of the organization to delete',
    })
    @ApiOperation({})
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async delete(@Param('id') id: string, @Res() res: Response, @Req() req: RequestWithUser): Promise<Response> {
        try {
            const userId = req.user._id;
            const resp = await this._organizationsService.delete(id, userId);
            return res.json(resp);
        } catch (error: unknown) {
            if (error instanceof Error) {
                return res.status((error as any).code?.status || 500).json(error);
            } else {
                return res.status(500).json(error);
            }
        }
    }
}
