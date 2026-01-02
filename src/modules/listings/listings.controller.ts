import {
  Body,
  Controller,
  Get,
  ParseArrayPipe,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiDefaultResponse, ApiResponse } from '@nestjs/swagger';
import { SearchDto } from '../search/dto/SearchDto';
import { GetUser } from '../auth/get-user.decorator';
import { Users } from '../users/entities/Users.entity';
import { AllowAny } from '../auth/allow-any.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/types/Role.enum';
import { QueryFilter } from './dto/QueryFilterDto';
// import { UpdateListingByIds } from './dto/UpdateListingId.dto';
import { PropertiesService } from './services/properties.service';
import { UpdateCoordinatesDto } from './dto/UpdateCoordinatesDto';

@Controller('listings')
export class ListingsController {
  // constructor(private readonly listingsService: ListingsService) { }
  constructor(private readonly propertiesService: PropertiesService) { }

  @Get('/fetchNewData')
  //@UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  @ApiDefaultResponse({
    description: 'Fetch endpoint.',
    type: SearchDto,
  })
  public async saveData(
    @GetUser() user: Users
  ): Promise<any> {
    return await this.propertiesService.saveData(user);
  }

  @Get('/updateCoordinatesFromDBByAddressAndZip')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  @AllowAny()
  @ApiDefaultResponse({
    description: 'Fetch endpoint.',
    type: SearchDto,
  })
  public async updateCoordinatesFromDBByAddressAndZip(): Promise<any> {
    return await this.propertiesService.updateCoordinatesFromDBByAddressAndZip();
  }

  @Get('/fetchMissingCoordinates')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  public async fetchMissingListings(): Promise<any> {
    return await this.propertiesService.fetchMissingCoordinates();
  }

  // @Get('/fetchNewOpenHouse')
  // @UseGuards(JwtAuthGuard)
  // @Roles(Role.ADMIN)
  // @ApiDefaultResponse({
  //   description: 'fetchNewOpenHouse',
  //   type: SearchDto,
  // })
  // public async saveOpenHouse(): Promise<any> {
  //   return await this.propertiesService.saveOpenHouseData();
  // }

  @Get('/fetchPropertyByFilter')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  @ApiDefaultResponse({})
  public async fetchPropertyByFilter(@Query() query: object): Promise<any> {
    return await this.propertiesService.fetchPropertyByFilter(query);
  }

  @Get('/noCoordinates')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  @ApiDefaultResponse({
    description: 'Get All properties without coordinates',
    type: SearchDto,
  })
  public async noCoordinates(): Promise<any> {
    return await this.propertiesService.getPropertiesWithoutCoordinates();
  }

  @Put('/updateCoordinates')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  @AllowAny()
  @ApiResponse({ status: 200, description: 'Coordinates were updated' })
  @ApiDefaultResponse({
    description: 'Update addresses without coordinates manually',
    type: SearchDto,
  })
  public async updateCoordinatesManually(
    @Body(new ParseArrayPipe({items: UpdateCoordinatesDto})) 
    properties: UpdateCoordinatesDto[]): Promise<any> {
    await this.propertiesService.updateCoordinates(properties);

    return { status: 200, description: 'Coordinates were updated' }
  }

  @Get('/updateCoordinates')
  @UseGuards(JwtAuthGuard)
  @AllowAny()
  @Roles(Role.ADMIN)
  @ApiDefaultResponse({
    description: 'Update addresses without coordinates',
    type: SearchDto,
  })
  public async updateCoordinates(): Promise<any> {
    return await this.propertiesService.updateCoordinatesFromDBCron();
  }

  @Get('/autosugestion')
  @ApiDefaultResponse({
    description: 'Autosugestion endpoint.',
    type: SearchDto,
  })
  @AllowAny()
  @UseGuards(JwtAuthGuard)
  public async autosugestionSearch(@Query() query: object, @GetUser() user): Promise<any> {
    return await this.propertiesService.autocompleteSearch(
      query['search'],
      query['saleOrRental'],
      user
    );
  }

  @Get('/searchQuery')
  @ApiDefaultResponse({
    description: 'Search endpoint.',
  })
  @AllowAny()
  @UseGuards(JwtAuthGuard)
  public async searchBy(@Query() query: QueryFilter, @GetUser() user): Promise<any> {
    return await this.propertiesService.searchBy(query, user);
  }

  @Get('/apartment')
  @ApiDefaultResponse({
    description: 'Get apartment by Id endpoint.',
  })
  @AllowAny()
  @UseGuards(JwtAuthGuard)
  public async getById(
    @GetUser() user: Users,
    @Query() query: object
  ): Promise<any> {
    return await this.propertiesService.getById(query, user);
  }

  @Get('/building')
  @ApiDefaultResponse({
    description: 'Get building',
  })
  @AllowAny()
  @UseGuards(JwtAuthGuard)
  public async getBuilding(
    @GetUser() user: Users,
    @Query() query: object
  ): Promise<any> {
    return await this.propertiesService.getBuilding(query, user);
  }
}
