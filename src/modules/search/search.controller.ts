import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { SearchService } from "./search.service";
import { ApiDefaultResponse } from "@nestjs/swagger";
import { SearchDto } from "./dto/SearchDto";

@Controller('search')
export class SearchController {
    constructor(
        private readonly searchService: SearchService
    ) { }

    // @Get()
    // @ApiDefaultResponse({
    //     description: 'Search endpoint.',
    //     type: SearchDto
    // })
    // public async search(
    //     // @Query() authDto: SearchDto
    // ): Promise<any> {
    //     return await this.searchService.search();
    // }
}
