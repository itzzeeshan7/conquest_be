import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Roles } from "../auth/roles.decorator";
import { Role } from "../users/types/Role.enum";
import { OpenData } from "./entities/OpenData.entity";
import { OpenDataApisService } from "./services/open-data-apis.service";

@ApiTags('OtherApis')
@Controller('other-apis')

export class OtherApisController {
    constructor(private readonly openDataService: OpenDataApisService) { }

    @Get()
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @Roles(Role.ADMIN)
    public async getOne(@Query() id: number): Promise<OpenData> {
        return await this.openDataService.getOne(id);
    }

    @Get('/get-all')
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @Roles(Role.ADMIN)
    public async getAll(): Promise<OpenData[]> {
        return await this.openDataService.getAll();
    }

    @Post('/update')
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @Roles(Role.ADMIN)
    public async update(@Body() openData: OpenData) {
        return await this.openDataService.updateAsAdmin(openData);
    }

    @Get('/news')
    public async getNews(): Promise<any> {
        return await this.openDataService.getNews();
    }
}