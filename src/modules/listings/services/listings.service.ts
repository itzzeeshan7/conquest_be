import { BadRequestException, Injectable, Logger, Scope } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { PerchwellService } from '../../../libs/perchwell/perchwell.service';
import { ERRORS_CONSTANTS } from '../../../shared/constants/errors.constants';
import { ILocation } from '../../../shared/interfaces/location.interface';
import { RedisServiceAdapter } from '../../../shared/redis-adapter/redis-adapter.service';
import { OpenDataApisService } from '../../other-apis/services/open-data-apis.service';
import { UserDto } from '../../users/dto/User.dto';
import { ScheduledViewing } from '../../users/entities/ScheduledViewing.entity';
import { Users } from '../../users/entities/Users.entity';
import { UserStorage } from '../../users/entities/UserStorage.entity';
import { AutosuggestionSearchDto } from '../dto/AutosuggestionSearchDto';
import { QueryFilter } from '../dto/QueryFilterDto';
import { UpdateListingByIds } from '../dto/UpdateListingId.dto';
import { ListingEntity } from '../entities/Listing.entity';
import { ListingsRepository } from '../repositories/Listings.repository';
import * as fs from 'fs'

@Injectable({ scope: Scope.REQUEST })
export class ListingsService {
  private readonly logger = new Logger(ListingsService.name);
  constructor(
    public listingRepository: ListingsRepository,
    private readonly perchwellService: PerchwellService,
    private readonly openDataApisService: OpenDataApisService,
    private readonly redisServiceAdapter: RedisServiceAdapter,
  ) { }

  public async findOne(query: object): Promise<ListingEntity> {
    return await this.listingRepository.findOne(query);
  }

  public async saveData(): Promise<Object> {
    let arr = [1];

    let resultLength: number = 0;

    for await (let el of arr) {
      const data = await this.perchwellService.fetchDataFromPerchwell(
        '',
        resultLength
      );

      data.forEach((el) => {
        let listingEntity = new ListingEntity();
        listingEntity = plainToClass(ListingEntity, el);
        try {
          listingEntity.save();
        } catch (e) {
          console.log(el);
          console.log(ERRORS_CONSTANTS.DB[e.code]('ListingEntity'));
        } finally {
        }
      });
      resultLength += data.length;
      if (data.length) {
        arr.push(el + 1);
      }
    }
    this.logger.debug(`Successfull fetch all data from Perchwell`);
    this.logger.debug(`Created ${resultLength} records.`);
    return resultLength;
  }

  public async updateListingByIds(listingIds: UpdateListingByIds[]): Promise<Object> {
    for await (let el of listingIds) {
      const data = await this.perchwellService.fetchDataFromPerchwell(`(Id=${+el.id})`, 0);

      let listingEntity = new ListingEntity();
      listingEntity = plainToClass(ListingEntity, data[0]);
      this.logger.debug(`${data[0]['id']}`);
      try {
        listingEntity.save();
      } catch (e) {
        console.log(el);
        console.log(ERRORS_CONSTANTS.DB[e.code]('ListingEntity'));
      } finally {
      }
    }
    this.logger.debug(`Successfull fetch all data from Perchwell`);
    this.logger.debug(`Created ${listingIds} records.`);
    return listingIds.length;
  }

  public async updateCoordinates() {
    const listingIds = await this.listingRepository.createQueryBuilder()
      .select(`id`)
      .andWhere(`combined_longitude is null and combined_latitude is null and status_code = 100`)
      .getRawMany();

    return await this.updateListingByIds(listingIds);
  }

  public async updateCoordinatesFromSearch(queryFilter: QueryFilter, placesesInclude: any[]) {
    let queryBuilder = this.listingRepository.createQueryBuilder('ls').select(['id']);
    queryBuilder = queryBuilder.where(`ls.status_code = 100`);
    switch (queryFilter.type) {
      case 'Places':
        if (placesesInclude.length > 0) {
          queryBuilder.andWhere(`lower(ls.place_name) IN (:...search)`, { search: placesesInclude });
        } else {
          queryBuilder.andWhere(`lower(ls.place_name) = :search `, { search: `${queryFilter.search.toLowerCase()}` });
        }
        break;
      case 'Cities':
        queryBuilder.andWhere(`lower(ls.city) = :search`, { search: `${queryFilter.search.toLowerCase()}` });
        break;
      case 'Zip':
        queryBuilder.andWhere(`lower(ls.zip) = :search`, { search: `${queryFilter.search.toLowerCase()}` })
        break;
    }

    queryBuilder.andWhere(`ls.sale_or_rental = :saleOrRental`, { saleOrRental: `${queryFilter.salesOrRental}` });
    queryBuilder.andWhere(`ls.combined_latitude is null`);
    queryBuilder.andWhere(`ls.combined_longitude is null`);

    const updateCoordinates = await queryBuilder.getRawMany();

    if (updateCoordinates.length > 0) {
      this.updateListingByIds(updateCoordinates);
    }
  }

  public async autocompleteSearch(
    search?: string,
    saleOrRental?: string,
    user?: UserDto
  ): Promise<AutosuggestionSearchDto[]> {

    let logged = 'logged';
    if (typeof user === 'object' && user !== null) {
      logged = 'logged'
    } else {
      logged = 'not_logged'
    }

    const redisResults = await this.redisServiceAdapter.get(`${logged}_autocomplete_${saleOrRental}_${search.replace(/ /g, '-')}`);

    if (redisResults) {
      return JSON.parse(redisResults);
    }

    const newYork = JSON.parse(fs.readFileSync('./assets/new-york-places.json', 'utf8'));
    const mainPlaces = Object.keys(newYork);
    const places = Object.values(newYork) as any[];
    const allPlaces = [...mainPlaces, ...places.flat(Infinity)];

    let searchQuery = [
      `COALESCE(building_id, 0) as building_id`,
      `COALESCE(zip, '') as zip`,
      `COALESCE(city, '') as city`,
      `COALESCE(building_name, '') as building_name`,
      `COALESCE(address, '') as address`]

    let queryBuilder = this.listingRepository.createQueryBuilder()
      .select(searchQuery)

    queryBuilder.where(`(lower(address) like :search
    or lower(building_name) like :search 
    or zip like :search)`, { search: `%${search}%` });

    let data = await queryBuilder.getRawMany();

    let placeNameSet = new Set();
    let zipSet = new Set();
    let buildingNameSet = new Set();
    let addressSet = new Set();
    let citySet = new Set();

    for (let place of allPlaces) {
      if (place.toLowerCase().indexOf(search) > -1) {
        placeNameSet.add(JSON.stringify({ type: 'Places', place_name: place }));
      }
    }

    data.forEach(element => {
      if (element.building_name.toLowerCase().includes(search)) {
        buildingNameSet.add(JSON.stringify({ type: 'Buildings', building_name: element.building_name, building_id: element.building_id }));
      }
      if (element.zip.includes(search)) {
        zipSet.add(JSON.stringify({ type: 'Zip', zip: element.zip }));
      }
      if (element.address.toLowerCase().includes(search)) {
        addressSet.add(JSON.stringify({ type: 'Address', address: element.address, building_id: element.building_id }));
      }
      if (element.city.toLowerCase().includes(search)) {
        citySet.add(JSON.stringify({ type: 'City', city: element.city }));
      }
    });

    const placeNameArray: object[] = Array.from(placeNameSet).map((el: string) => JSON.parse(el));
    const zipArray: object[] = Array.from(zipSet).map((el: string) => JSON.parse(el));
    const buildingNameArray: object[] = Array.from(buildingNameSet).map((el: string) => JSON.parse(el));
    const addressArray: object[] = [...new Map(Array.from(addressSet).map((el: string) => JSON.parse(el)).map(item => [item['building_id'], item])).values()];
    const cityArray: object[] = Array.from(citySet).map((el: string) => JSON.parse(el));

    const dataReturn = [...placeNameArray, ...zipArray, ...buildingNameArray, ...addressArray, ...cityArray] as AutosuggestionSearchDto[];

    if (dataReturn.length > 0) {
      await this.redisServiceAdapter.setWithExp(`${logged}_autocomplete_${saleOrRental}_${search.replace(/ /g, '-')} `, JSON.stringify(data), 'EX', 60 * 60 * 3);
    }

    return dataReturn;
  }

  public async searchBy(query: QueryFilter, user: Users): Promise<any> {
    let queryFilter: QueryFilter = query;
    queryFilter = this.parseNullandBoolean(queryFilter);

    if (!queryFilter.salesOrRental) {
      queryFilter.salesOrRental = 'S'
    }

    let logged = 'logged';
    if (typeof user === 'object' && user !== null) {
      logged = 'logged'
    } else {
      logged = 'not_logged'
    }

    const redisResults = await this.redisServiceAdapter.get(`${logged}_search_by_${JSON.stringify(queryFilter).replace(/ /g, '-')}`);

    if (redisResults) {
      return JSON.parse(redisResults);
    }

    const newYork = JSON.parse(fs.readFileSync('./assets/new-york-places.json', 'utf8'));

    const placeses = !newYork[queryFilter.search] ? [] : newYork[queryFilter.search];
    const childrenPlaces = placeses.reduce((acc, place) => {
      if (newYork[place]) {
        acc = [...acc, ...newYork[place].map((lower) => lower.toLowerCase())];
      }
      return acc;
    }, [])
    const placesesInclude = childrenPlaces.length > 0 ? childrenPlaces : placeses.map((place) => place.toLowerCase())


    let searchQuery: string[] = [`ls.id as id`, `ls.city as city`]

    if (typeof user === 'object' && user !== null) {
      searchQuery.push(`case 
      when us.id is not null then true
      else false
      end as saved_data`);
    }

    searchQuery = [...searchQuery, `  array[image_list_without_floorplans[1]] as image_list`, `ls.real_estate_tax as tax`, `ls.hoa_fee as fee`,
      `ls.listing_price as listing_price`, `ls.address as address`, `ls.building_name as building_name`,
      `ls.address_with_unit as address_with_unit`, `ls.combined_latitude as combined_latitude`,
      `ls.combined_longitude as combined_longitude`, `ls.num_bedrooms as num_bedrooms`, `ls.num_baths as num_baths`,
      `ls.sqft as sqft`, `ls.place_name as place_name`, `ls.list_date as list_date`, `ls.updated_at as created_at`];

    let queryBuilder = this.listingRepository.createQueryBuilder('ls')
      .select(searchQuery)

    queryBuilder = queryBuilder.where(`ls.status_code = 100`);
    switch (queryFilter.type) {
      case 'Places':
        if (placesesInclude.length > 0) {
          queryBuilder.andWhere(`lower(ls.place_name) IN (:...search)`, { search: placesesInclude });
        } else {
          queryBuilder.andWhere(`lower(ls.place_name) = :search `, { search: `${queryFilter.search.toLowerCase()}` });
        }
        break;
      case 'Cities':
        queryBuilder.andWhere(`lower(ls.city) = :search`, { search: `${queryFilter.search.toLowerCase()}` });
        break;
      case 'Zip':
        queryBuilder.andWhere(`lower(ls.zip) = :search`, { search: `${queryFilter.search.toLowerCase()}` })
        break;
    }

    queryBuilder.andWhere(`ls.combined_latitude is not null`);
    queryBuilder.andWhere(`ls.combined_longitude is not null`);

    if (typeof user === 'object' && user !== null) {
      queryBuilder = queryBuilder.leftJoin(UserStorage, 'us', `us."userId" = :id and us."apartamentId" = ls.id`, { id: `${user.id}` })
    } else {
      queryBuilder = queryBuilder.andWhere(`ls.rls_idx_display = true`);
      queryBuilder = queryBuilder.andWhere(`(ls.vow_address_display is null or true)`);
      queryBuilder = queryBuilder.andWhere(`(ls.vow_entire_listing_display is null or true)`);
    }

    if (queryFilter.propertyType) {
      if (queryFilter.propertyType.split(',').length > 0) {
        queryBuilder.andWhere(`ls.property_type_code  IN (:...propertyType)`, { propertyType: queryFilter.propertyType.split(',') });
      }
    }

    if (queryFilter.bathroomsFrom || queryFilter.bathroomsTo) {
      let query = ``;
      if (queryFilter.bathroomsFrom && !queryFilter.bathroomsTo) {
        query = `(ls.num_baths >= :bathroomsFrom)`
      } else if (!queryFilter.bathroomsFrom && queryFilter.bathroomsTo) {
        if (queryFilter.bathroomsTo == 4) {
          query = `(ls.num_baths >= :bathroomsTo)`
        } else {
          query = `(ls.num_baths <= :bathroomsTo)`
        }
      } else {
        if (queryFilter.bathroomsTo == 4) {
          query = `(ls.num_baths >= :bathroomsFrom and ls.num_baths >= :bathroomsTo)`
        } else {
          query = `(ls.num_baths >= :bathroomsFrom and ls.num_baths <= :bathroomsTo)`
        }
      }
      queryBuilder.andWhere(query, { bathroomsFrom: +queryFilter.bathroomsFrom, bathroomsTo: +queryFilter.bathroomsTo })
    }

    if (queryFilter.bedroomsFrom || queryFilter.bedroomsTo) {
      let query = ``;
      if (queryFilter.bedroomsFrom && !queryFilter.bedroomsTo) {
        query = `(ls.num_bedrooms >= :bedroomsFrom)`
      } else if (!queryFilter.bedroomsFrom && queryFilter.bedroomsTo) {
        if (queryFilter.bathroomsTo == 4) {
          query = `(ls.num_bedrooms >= :bedroomsTo)`
        } else {
          query = `(ls.num_bedrooms <= :bedroomsTo)`
        }
      } else {
        if (queryFilter.bedroomsTo == 4) {
          query = `(ls.num_bedrooms >= :bedroomsFrom and ls.num_bedrooms >= :bedroomsTo)`
        } else {
          query = `(ls.num_bedrooms >= :bedroomsFrom and ls.num_bedrooms <= :bedroomsTo)`
        }
      }
      queryBuilder.andWhere(query, { bedroomsFrom: +queryFilter.bedroomsFrom, bedroomsTo: +queryFilter.bedroomsTo })
    }

    if (queryFilter.priceFrom || queryFilter.priceTo) {
      let query = ``;
      if (queryFilter.priceFrom && !queryFilter.priceTo) {
        query = `(ls.listing_price >= :priceFrom)`
      } else if (!queryFilter.priceFrom && queryFilter.priceTo) {
        query = `(ls.listing_price <= :priceTo)`
      } else {
        query = `(ls.listing_price >= :priceFrom and ls.listing_price <= :priceTo)`
      }

      queryBuilder.andWhere(query, { priceFrom: +queryFilter.priceFrom, priceTo: +queryFilter.priceTo });
    }

    if (queryFilter.priceSqfFrom || queryFilter.priceSqfTo) {
      let query = ``;
      if (queryFilter.priceSqfFrom && !queryFilter.priceSqfTo) {
        query = `(ls.listing_price_per_sqft >= :priceSqfFrom)`
      } else if (!queryFilter.priceSqfFrom && queryFilter.priceSqfTo) {
        query = `(ls.listing_price_per_sqft <= :priceSqfTo)`
      } else {
        query = `(ls.listing_price_per_sqft >= :priceSqfFrom and ls.listing_price_per_sqft <= :priceSqfTo)`
      }
      queryBuilder.andWhere(query, { priceSqfFrom: +queryFilter.priceSqfFrom, priceSqfTo: +queryFilter.priceSqfTo })
    }

    if (queryFilter.totalRoomsFrom || queryFilter.totalRoomsTo) {
      let query = ``;
      if (queryFilter.totalRoomsFrom && !queryFilter.totalRoomsTo) {
        query = `(ls.num_rooms >= :totalRoomsFrom)`
      } else if (!queryFilter.totalRoomsFrom && queryFilter.totalRoomsTo) {
        query = `(ls.num_rooms <= :totalRoomsTo)`
      } else {
        query = `(ls.num_rooms >= :totalRoomsFrom and ls.num_rooms <= :totalRoomsTo)`
      }
      queryBuilder.andWhere(query, { totalRoomsFrom: +queryFilter.totalRoomsFrom, totalRoomsTo: +queryFilter.totalRoomsTo })
    }

    if (queryFilter.sqftFrom || queryFilter.sqftTo) {
      let query = ``;
      if (queryFilter.sqftFrom && !queryFilter.sqftTo) {
        query = `(ls.sqft >= :sqftFrom)`
      } else if (!queryFilter.sqftFrom && queryFilter.sqftTo) {
        query = `(ls.sqft <= :sqftTo)`
      } else {
        query = `(ls.sqft >= :sqftFrom and ls.sqft <= :sqftTo)`
      }
      queryBuilder.andWhere(query, { sqftFrom: +queryFilter.sqftFrom, sqftTo: +queryFilter.sqftTo })
    }

    if (queryFilter.yearBuiltFrom || queryFilter.yearBuiltTo) {
      let query = ``;
      if (queryFilter.yearBuiltFrom && !queryFilter.yearBuiltTo) {
        query = `(ls.year_built >= :yearBuiltFrom)`
      } else if (!queryFilter.yearBuiltFrom && queryFilter.yearBuiltTo) {
        query = `(ls.year_built <= :yearBuiltTo)`
      } else {
        query = `(ls.year_built >= :yearBuiltFrom and ls.year_built <= :yearBuiltTo)`
      }
      queryBuilder.andWhere(query, { yearBuiltFrom: +queryFilter.yearBuiltFrom, yearBuiltTo: +queryFilter.yearBuiltTo })
    }

    if (queryFilter.doorman) {
      queryBuilder.andWhere(`ls.building_doorman = true`);
    } else {
      if (queryFilter.doorman === false) {
        queryBuilder.andWhere(`ls.building_doorman = false`);
      }
    }

    if (queryFilter.gym) {
      queryBuilder.andWhere(`ls.building_gym = true`);
    } else {
      if (queryFilter.gym === false) {
        queryBuilder.andWhere(`ls.building_gym = false`);
      }
    }

    if (queryFilter.garage) {
      queryBuilder.andWhere(`ls.building_garage = true`);
    } else {
      if (queryFilter.garage === false) {
        queryBuilder.andWhere(`ls.building_garage = false`);
      }
    }

    if (queryFilter.pool) {
      queryBuilder.andWhere(`ls.building_pool = true`);
    } else {
      if (queryFilter.pool === false) {
        queryBuilder.andWhere(`ls.building_pool = false`);
      }
    }

    if (queryFilter.elevator) {
      queryBuilder.andWhere(`ls.building_elevator = true`);
    } else {
      if (queryFilter.elevator === false) {
        queryBuilder.andWhere(`ls.building_elevator = false`);
      }
    }

    if (queryFilter.pets) {
      queryBuilder.andWhere(`ls.building_pets = true`);
    } else {
      if (queryFilter.pets === false) {
        queryBuilder.andWhere(`ls.building_pets = false`);
      }
    }

    if (queryFilter.washerDayer) {
      queryBuilder.andWhere(`ls.dishwasher = true`);
    } else {
      if (queryFilter.washerDayer === false) {
        queryBuilder.andWhere(`ls.dishwasher = false`);
      }
    }

    if (queryFilter.prewar) {
      queryBuilder.andWhere(`ls.building_prewar = true`);
    } else {
      if (queryFilter.prewar === false) {
        queryBuilder.andWhere(`ls.building_prewar = false`);
      }
    }

    if (queryFilter.rooftop) {
      queryBuilder.andWhere(`ls.building_rooftop = true`);
    } else {
      if (queryFilter.rooftop === false) {
        queryBuilder.andWhere(`ls.building_rooftop = false`);
      }
    }

    if (queryFilter.outdorSpace) {
      queryBuilder.andWhere(`ls.has_outdoor_space = true`);
    } else {
      if (queryFilter.outdorSpace === false) {
        queryBuilder.andWhere(`ls.has_outdoor_space = false`);
      }
    }

    if (queryFilter.buildingLaundry) {
      queryBuilder.andWhere(`ls.building_laundry = true`);
    } else {
      if (queryFilter.buildingLaundry === false) {
        queryBuilder.andWhere(`ls.building_laundry = false`);
      }
    }

    if (queryFilter.newDevelopment) {
      queryBuilder.andWhere(`ls.new_development = true`);
    } else {
      if (queryFilter.newDevelopment === false) {
        queryBuilder.andWhere(`ls.new_development = false`);
      }
    }
    queryBuilder.andWhere(`ls.sale_or_rental = :saleOrRental`, { saleOrRental: `${queryFilter.salesOrRental}` });
    queryBuilder = queryBuilder.orderBy('ls.created_at', 'ASC');    
    let searchData = await queryBuilder.execute();

    if (queryFilter.monthliesFrom || queryFilter.monthliesTo) {
      if (queryFilter.monthliesFrom && !queryFilter.monthliesTo) {
        searchData = searchData.filter((apartment) => {
          return (apartment.fee + apartment.tax) >= queryFilter.monthliesFrom
        })
      } else if (!queryFilter.monthliesFrom && queryFilter.monthliesTo) {
        searchData = searchData.filter((apartment) => {
          return (apartment.fee + apartment.tax) <= queryFilter.monthliesTo
        })
      } else {
        searchData = searchData.filter((apartment) => {
          return ((apartment.fee + apartment.tax) >= queryFilter.monthliesFrom) && ((apartment.fee + apartment.tax) <= queryFilter.monthliesTo)
        })
      }
    }

    const minMaxQuery = [`MIN(listing_price) AS min`, `MAX(listing_price) AS max`]

    let queryBuilderMinMax = this.listingRepository.createQueryBuilder('ls').select(minMaxQuery);
    queryBuilderMinMax = queryBuilderMinMax.where(`ls.status_code = 100`);
    switch (queryFilter.type) {
      case 'Places':
        if (placesesInclude.length > 0) {
          queryBuilder.andWhere(`lower(ls.place_name) IN (:...search)`, { search: placesesInclude });
        } else {
          queryBuilder.andWhere(`lower(ls.place_name) = :search `, { search: `${queryFilter.search.toLowerCase()}` });
        }
        break;
      case 'Cities':
        queryBuilderMinMax.andWhere(`lower(ls.city) = :search`, { search: `${queryFilter.search.toLowerCase()}` });
        break;
      case 'Zip':
        queryBuilderMinMax.andWhere(`lower(ls.zip) = :search`, { search: `${queryFilter.search.toLowerCase()}` })
        break;
    }

    queryBuilderMinMax.andWhere(`ls.sale_or_rental = :saleOrRental`, { saleOrRental: `${queryFilter.salesOrRental}` });

    const minMaxPrice = await queryBuilderMinMax.getRawOne();
    this.updateCoordinatesFromSearch(queryFilter, placesesInclude);

    let viewedSearch = [];

    if (typeof user === 'object' && user !== null) {
      viewedSearch = [...searchData].slice(0, 2583);
    } else {
      viewedSearch = [...searchData].slice(0, 200);
    }

    const results = {
      totalResults: searchData.length,
      searchData: viewedSearch,
      minMaxPrice: minMaxPrice
    }

    if (results.searchData.length > 0) {
      await this.redisServiceAdapter.setWithExp(`${logged}_search_by_${JSON.stringify(queryFilter).replace(/ /g, '-')}`, JSON.stringify(results), 'EX', 60 * 60 * 3);
    }

    return results;
  }

  public async getById(query: Object, user: Users): Promise<any> {
    const id = query['id'];
    let logged = 'logged';
    if (typeof user === 'object' && user !== null) {
      logged = 'logged'
    } else {
      logged = 'not_logged'
    }

    if (!id) {
      throw new BadRequestException(['listing id missing']);
    }
    let data;

    data = await this.redisServiceAdapter.get(`${logged}_${id}`);

    if (data) {
      return JSON.parse(data);
    }

    let queryBuilder = this.listingRepository.createQueryBuilder('ls')
      .select([`ls.*`])
      .where(`ls.id = :id`, { id })

    if (typeof user === 'object' && user !== null) {
      queryBuilder = queryBuilder.leftJoinAndSelect(ScheduledViewing, 'sw', `sw.user_id = :userId and sw.apartment_id = ls.id and sw.canceled = false and sw.scheduled_date >= CURRENT_DATE`, { userId: `${user.id}` })
      queryBuilder = queryBuilder.leftJoinAndSelect(UserStorage, 'us', `us."userId" = :userId and us."apartamentId" = ls.id`, { userId: `${user.id}` })
    }

    const apartamentDetailsDb = await queryBuilder.getRawOne();

    let apartamentDetails = {
      id: id,
      address: apartamentDetailsDb.address,
      num_bedrooms: apartamentDetailsDb.num_bedrooms,
      address_with_unit: apartamentDetailsDb.address,
      num_baths: apartamentDetailsDb.num_baths,
      num_rooms: apartamentDetailsDb.num_rooms,
      listing_price: apartamentDetailsDb.listing_price,
      num_units: apartamentDetailsDb.num_units,
      combined_latitude: apartamentDetailsDb.combined_latitude,
      sale_or_rental: apartamentDetailsDb.sale_or_rental,
      combined_longitude: apartamentDetailsDb.combined_longitude,
      place_name: apartamentDetailsDb.place_name,
      year_built: apartamentDetailsDb.year_built,
      city: apartamentDetailsDb.city,
      zip: apartamentDetailsDb.zip,
      building_name: apartamentDetailsDb.building_name,
      building_id: apartamentDetailsDb.building_id,
      image_list_without_floorplans: [apartamentDetailsDb.image_list_without_floorplans[0]],
      floor_plan_list: []
    } as any;
    switch (apartamentDetailsDb.status_code) {
      case 100:
        apartamentDetails.status = 'Active'
        break;
      case 200:
        apartamentDetails.status = 'Accepted Offer'
        break;
      case 240:
        apartamentDetails.status = 'Under Contract'
        break;
      case 300:
        apartamentDetails.status = 'Expired'
        break;
      case 400:
        apartamentDetails.status = 'Rented'
        break;
      case 500:
        apartamentDetails.status = 'Sold'
        break;
      case 600:
        apartamentDetails.status = 'Permanently Off-Market'
        break;
      case 640:
        apartamentDetails.status = 'Temporarily Off-Market'
        break;
    }

    let apartamentAmenities = {
      central_ac: apartamentDetailsDb.central_ac,
      catering_kitchen: apartamentDetailsDb.catering_kitchen,
      central_park_view: apartamentDetailsDb.central_park_view,
      park_view: apartamentDetailsDb.park_view,
      cold_storage: apartamentDetailsDb.cold_storage,
      dishwasher: apartamentDetailsDb.dishwasher,
      conference_room: apartamentDetailsDb.conference_room,
      has_outdoor_space: apartamentDetailsDb.has_outdoor_space,
      courtyard: apartamentDetailsDb.courtyard,
      new_development: apartamentDetailsDb.new_development,
      dining_room: apartamentDetailsDb.dining_room,
      dog_care: apartamentDetailsDb.dog_care,
      eat_in_kitchen: apartamentDetailsDb.eat_in_kitchen,
      electric_car_chargers: apartamentDetailsDb.electric_car_chargers,
      galley_kitchen: apartamentDetailsDb.galley_kitchen,
      garden: apartamentDetailsDb.garden,
      guest_suites: apartamentDetailsDb.guest_suites,
      has_fireplace: apartamentDetailsDb.has_fireplace,
      library: apartamentDetailsDb.library,
      lounge: apartamentDetailsDb.lounge,
      package_room: apartamentDetailsDb.package_room,
      media_room: apartamentDetailsDb.media_room,
      porte_cochere: apartamentDetailsDb.porte_cochere,
      screening_room: apartamentDetailsDb.screening_room,
      skyline_view: apartamentDetailsDb.skyline_view,
      spa: apartamentDetailsDb.spa,
      unit_balcony: apartamentDetailsDb.unit_balcony,
      water_view: apartamentDetailsDb.water_view,
      wrap_terrace: apartamentDetailsDb.wrap_terrace,
      yoga_studio: apartamentDetailsDb.yoga_studio
    }

    let buildingAmenities = {
      building_bike_storage: apartamentDetailsDb.building_bike_storage,
      building_doorman: apartamentDetailsDb.building_doorman,
      building_elevator: apartamentDetailsDb.building_elevator,
      building_garage: apartamentDetailsDb.building_garage,
      building_gym: apartamentDetailsDb.building_gym,
      building_laundry: apartamentDetailsDb.building_laundry,
      building_pets: apartamentDetailsDb.building_pets,
      building_pool: apartamentDetailsDb.building_pool,
      building_prewar: apartamentDetailsDb.building_prewar,
      building_rooftop: apartamentDetailsDb.building_rooftop,
      building_storage: apartamentDetailsDb.building_storage,
    }
    if (typeof user === 'object' && user !== null) { //`ls.commission_amount as commission_amount`,
      apartamentDetails.address_with_unit = apartamentDetailsDb.address_with_unit;
      apartamentDetails.image_list_without_floorplans = apartamentDetailsDb.image_list_without_floorplans;
      apartamentDetails.sqft = apartamentDetailsDb.sqft;
      apartamentDetails.listing_price_per_sqft = apartamentDetailsDb.listing_price_per_sqft;
      apartamentDetails.floor_plan_list = apartamentDetailsDb.floor_plan_list;
      apartamentDetails.hoa_fee = apartamentDetailsDb.hoa_fee;
      apartamentDetails.real_estate_tax = apartamentDetailsDb.real_estate_tax;
      apartamentDetails.total_monthlies = apartamentDetailsDb.total_monthlies;
      apartamentDetails.flip_tax_description = apartamentDetailsDb.flip_tax_description;
      apartamentDetails.cobroke_agreement = apartamentDetailsDb.cobroke_agreement;
      apartamentDetails.east_exposure = apartamentDetailsDb.east_exposure;
      apartamentDetails.north_exposure = apartamentDetailsDb.north_exposure;
      apartamentDetails.south_exposure = apartamentDetailsDb.south_exposure;
      apartamentDetails.west_exposure = apartamentDetailsDb.west_exposure;
      apartamentDetails.max_financing_pct = apartamentDetailsDb.max_financing_pct;
      apartamentDetails.rebny_id = apartamentDetailsDb.rebny_id;
      apartamentDetails.floor_number = apartamentDetailsDb.floor_number;
      apartamentDetails.renting_allowed = apartamentDetailsDb.renting_allowed;
      apartamentDetails.building_class = apartamentDetailsDb.building_class;
      // apartamentDetails.commission_type = apartamentDetailsDb.commission_type;
      apartamentDetails.bbl = apartamentDetailsDb.bbl;
      apartamentDetails.configuration = apartamentDetailsDb.configuration;
      apartamentDetails.furnished = apartamentDetailsDb.furnished;
      apartamentDetails.marketing_description = apartamentDetailsDb.marketing_description;
      apartamentDetails.pied_a_terre = apartamentDetailsDb.pied_a_terre;
      apartamentDetails.status_code = apartamentDetailsDb.status_code;
      apartamentDetails.brokerage_name = apartamentDetailsDb.brokerage_name;
      apartamentDetails.property_type = apartamentDetailsDb.property_type;
      apartamentDetails.user_loged = true;
      apartamentDetails.scheduled_date = apartamentDetailsDb.sw_scheduled_date;
      apartamentDetails.image_list_original = apartamentDetailsDb.image_list_original;
      apartamentDetails.saved_data = !!apartamentDetailsDb.us_id;
      apartamentDetails.scheduled_view = !!apartamentDetailsDb.sw_id;
      apartamentDetails.idx = true;
    } else {
      if (apartamentDetailsDb.rls_idx_display === true) {
        if (apartamentDetailsDb.status_code === 100) {
          apartamentDetails.image_list_without_floorplans = apartamentDetailsDb.image_list_without_floorplans;
          apartamentDetails.address_with_unit = apartamentDetailsDb.address_with_unit;
          apartamentDetails.sqft = apartamentDetailsDb.sqft;
          apartamentDetails.listing_price_per_sqft = apartamentDetailsDb.listing_price_per_sqft;
          apartamentDetails.floor_plan_list = apartamentDetailsDb.floor_plan_list;
          apartamentDetails.east_exposure = apartamentDetailsDb.east_exposure;
          apartamentDetails.north_exposure = apartamentDetailsDb.north_exposure;
          apartamentDetails.south_exposure = apartamentDetailsDb.south_exposure;
          apartamentDetails.west_exposure = apartamentDetailsDb.west_exposure;
          apartamentDetails.floor_number = apartamentDetailsDb.floor_number;
          apartamentDetails.building_class = apartamentDetailsDb.building_class;
          apartamentDetails.brokerage_name = apartamentDetailsDb.brokerage_name;
          apartamentDetails.property_type = apartamentDetailsDb.property_type;
          apartamentDetails.image_list_original = apartamentDetailsDb.image_list_original;
          apartamentDetails.idx = true;
        } else {
          apartamentDetails = {
            notAllowed: true
          }
          apartamentAmenities = undefined;
          buildingAmenities = undefined;
        }
      } else {
        if (apartamentDetailsDb.status_code === 100) {
          apartamentDetails.idx = false;
          apartamentAmenities = undefined;
          buildingAmenities = undefined;
        } else {
          apartamentDetails = {
            notAllowed: true
          }
          apartamentAmenities = undefined;
          buildingAmenities = undefined;
        }
      }
    }

    if (apartamentDetails.notAllowed) {
      data = {
        apartamentDetails: apartamentDetails,
      };

      this.redisServiceAdapter.setWithExp(`${logged}_${id}`, JSON.stringify(data), 'EX', 60 * 60 * 3);

      return data;
    }

    const location: ILocation = {
      latitude: +apartamentDetails.combined_latitude,
      longitude: +apartamentDetails.combined_longitude,
    };

    const { pointOfInterest, subwayStations, cityBike } = await this.getExtraInfo(location);

    const breadcrumbs = {
      city: apartamentDetails.city,
      zip: apartamentDetails.zip,
      place_name: apartamentDetails.place_name,
      address: apartamentDetails.address,
      building_name: apartamentDetails.building_name == '0' ? '' : apartamentDetails.building_name,
      building_id: apartamentDetails.building_id,
      address_with_unit: apartamentDetails.address_with_unit,
    };

    let similarApartments = []

    if (typeof user === 'object' && user !== null) {
      const similarApartmentsQuery = this.listingRepository.createQueryBuilder()
        .select([`id`, `listing_price`, `address_with_unit`, `num_bedrooms as beds`, `num_baths`, `sqft`, `place_name`,
          `image_list_without_floorplans[1] as image`])
        .where(`status_code = 100 and sale_or_rental = :saleOrRental and place_name like :placeName and id != :id and
      (listing_price = :listingPrice or sqft = :sqft or num_bedrooms = :bedrooms)`,
          {
            saleOrRental: `${apartamentDetails.sale_or_rental}`,
            listingPrice: `${apartamentDetails.listing_price ? apartamentDetails.listing_price : 0}`,
            sqft: `${apartamentDetails.sqft ? apartamentDetails.sqft : 0}`,
            placeName: `${apartamentDetails.place_name ? apartamentDetails.place_name : ''}`,
            bedrooms: `${apartamentDetails.num_bedrooms ? apartamentDetails.num_bedrooms : 0}`,
            id: `${id}`
          }).limit(15);
      similarApartments = await similarApartmentsQuery.execute();
    }

    data = {
      apartamentDetails: apartamentDetails,
      apartamentAmenities: apartamentAmenities,
      buildingAmenities: buildingAmenities,
      pointOfInterest: pointOfInterest,
      subwayStations: subwayStations,
      cityBike: cityBike,
      breadcrumbs: breadcrumbs,
      similarApartments: similarApartments,
    };

    this.redisServiceAdapter.setWithExp(`${logged}_${id}`, JSON.stringify(data), 'EX', 60 * 60 * 3);

    return data;
  }

  public async getBuilding(query: object, user: Users): Promise<any> {
    let type;
    let logged = 'logged';
    if (typeof user === 'object' && user !== null) {
      logged = 'logged'
    } else {
      logged = 'not_logged'
    }

    switch (query['type']) {
      case 'Buildings':
        type = 'building_name';
        break;
      case 'Address':
        type = 'address';
        break;
      case 'building_id':
        type = 'building_id'
        break;
    }

    const search = query['search'];

    let data;

    data = await this.redisServiceAdapter.get(`${logged}_${type}_${search.replace(/ /g, '-')}`);

    if (data) {
      return JSON.parse(data);
    }

    const buildingAmenitiesQueryBuilder = this.listingRepository.createQueryBuilder()
      .select(['building_id', 'building_bike_storage', 'building_doorman',
        'building_elevator', 'building_garage',
        'building_gym', 'building_laundry',
        'building_pets', 'building_pool', 'building_prewar',
        'building_rooftop', 'building_storage',
        'has_outdoor_space', 'new_development'])

    if (!isNaN(search)) {
      buildingAmenitiesQueryBuilder.where(`building_id = :search `, { search: search })
    } else {
      buildingAmenitiesQueryBuilder.where(`lower(${type}) like :address`, { address: `%${search.toLowerCase()}%` })
    }

    const buildingAmenitiesArray = await buildingAmenitiesQueryBuilder.execute();

    const buildingAmenities = {
      'building_id': buildingAmenitiesArray[0].building_id,
      'building_bike_storage': buildingAmenitiesArray.some((element) => element.building_bike_storage === true),
      'building_doorman': buildingAmenitiesArray.some((element) => element.building_doorman === true),
      'building_elevator': buildingAmenitiesArray.some((element) => element.building_elevator === true),
      'building_garage': buildingAmenitiesArray.some((element) => element.building_garage === true),
      'building_gym': buildingAmenitiesArray.some((element) => element.building_gym === true),
      'building_laundry': buildingAmenitiesArray.some((element) => element.building_laundry === true),
      'building_pets': buildingAmenitiesArray.some((element) => element.building_pets === true),
      'building_pool': buildingAmenitiesArray.some((element) => element.building_pool === true),
      'building_prewar': buildingAmenitiesArray.some((element) => element.building_prewar === true),
      'building_rooftop': buildingAmenitiesArray.some((element) => element.building_rooftop === true),
      'building_storage': buildingAmenitiesArray.some((element) => element.building_storage === true),
      'new_development': buildingAmenitiesArray[0].new_development
    }

    const buildingDetailsQueryBuilder = this.listingRepository.createQueryBuilder('ls')
      .select(['ls.building_id as building_id', 'ls.building_name as building_name', 'ls.address as address',
        'ls.num_stories as num_stories', 'ls.city as city', 'ls.zip as zip', 'ls.property_type as property_type', 'ls.place_name as place_name',
        'ls.year_built as year_built', 'ls.num_units as num_units', 'ls.building_class as building_class',
        'ls.floor_number as floor_number', 'ls.combined_longitude as combined_longitude', 'ls.combined_latitude as combined_latitude']);

    buildingDetailsQueryBuilder.distinctOn(['ls.address']);

    if (buildingAmenities.building_id) {
      buildingDetailsQueryBuilder.andWhere(`ls.building_id = :search`, { search: buildingAmenities.building_id })
    } else {
      buildingAmenitiesQueryBuilder.where(`lower(ls.${type}) like :address`, { address: `%${search.toLowerCase()}%` })
    }

    if (typeof user === 'object' && user !== null) {
      buildingDetailsQueryBuilder.addSelect(['ls.building_elevator', `true as user_loged`]);
      buildingDetailsQueryBuilder.addSelect([`case 
      when us.id is not null then true
      else false
      end as saved_data`])
      buildingDetailsQueryBuilder.addSelect([`case 
      when sw.id is not null then true
      else false
      end as scheduled_view`]);
      buildingDetailsQueryBuilder.addSelect([`sw.scheduled_date as scheduled_date`]);

      buildingDetailsQueryBuilder.leftJoin(ScheduledViewing, 'sw', `sw.user_id = :userId and sw.building_id = ls.building_id and sw.canceled = false and sw.scheduled_date >= CURRENT_DATE`, { userId: `${user.id}` })
      buildingDetailsQueryBuilder.leftJoin(UserStorage, 'us', `us."userId" = :userId and us.building_index = ls.building_id`, { userId: `${user.id}` })
    }

    const buildingDetails = await buildingDetailsQueryBuilder.getRawOne();
    buildingDetails.building_name = buildingDetails.building_name == '0' ? '' : buildingDetails.building_name;
    let apartments = [] as any;
    const apartmentsQueryBuilder = this.listingRepository.createQueryBuilder()
      .select(['id', `building_id`, 'address', 'address_with_unit', 'place_name', 'building_name',
        'num_baths', 'num_rooms', 'num_bedrooms',
        'num_units', 'num_stories', 'year_built', 'property_type',
        'floor_number', 'sale_or_rental', 'listing_price',
        'listing_price_per_sqft',
        'combined_longitude', 'combined_latitude', 'neighborhood', 'sqft',
        'image_list_without_floorplans[1] as image',
        'status_code', 'rls_idx_display', 'vow_address_display', 'vow_entire_listing_display'])
      .addSelect(` case
  when status_code = 100 then 'Active'
  when status_code = 200 then 'AcceptedOffer'
  when status_code = 240 then 'UnderContract'
  when status_code = 300 then 'Expired'
  when status_code = 400 then 'Rented'
  when status_code = 500 then 'Sold' 
  when status_code = 600 then 'Permanently Off-Market'
  when status_code = 640 then 'Temporarily Off-Market'
  end`, 'status')
    if (buildingAmenities.building_id) {
      apartmentsQueryBuilder.andWhere(`building_id = :search`, { search: buildingAmenities.building_id })
    } else {
      apartmentsQueryBuilder.where(`lower(${type}) like :address`, { address: `%${search.toLowerCase()}%` })
    }

    apartments = await apartmentsQueryBuilder.execute();

    const visibleActiveSalesApartments = apartments.filter((apartment) => {
      return (apartment.status_code == 100 && apartment.sale_or_rental === 'S')
    });

    const visibleActiveRentalsApartments = apartments.filter((apartment) => {
      return (apartment.status_code == 100 && apartment.sale_or_rental === 'R')
    });

    const visiblePastSalesApartments = apartments.filter((apartment) => {
      return (apartment.status_code != 100 && apartment.sale_or_rental === 'S')
    });

    const visiblePastRentalsApartments = apartments.filter((apartment) => {
      return (apartment.status_code != 100 && apartment.sale_or_rental === 'R')
    });

    if (!(typeof user === 'object' && user !== null)) {
      const visibleActiveSalesApartmentsIDX = visibleActiveSalesApartments.reduce((acc, apartment) => {
        if ((apartment.status_code == 100 && apartment.sale_or_rental === 'S' && (apartment.rls_idx_display === true &&
          (apartment.vow_address_display === null || apartment.vow_address_display) &&
          (apartment.vow_entire_listing_display === null || apartment.vow_entire_listing_display)))) {
          delete apartment.rls_idx_display;
          delete apartment.vow_address_display;
          delete apartment.vow_entire_listing_display;
          acc.push(apartment);
        } else {
          acc.push({ loginForMore: true });
        }
        return acc;
      }, []);

      const visibleActiveRentalsApartmentsIDX = visibleActiveRentalsApartments.reduce((acc, apartment) => {
        if ((apartment.status_code == 100 && apartment.sale_or_rental === 'R' && (apartment.rls_idx_display === true &&
          (apartment.vow_address_display === null || apartment.vow_address_display) &&
          (apartment.vow_entire_listing_display === null || apartment.vow_entire_listing_display)))) {
          delete apartment.rls_idx_display;
          delete apartment.vow_address_display;
          delete apartment.vow_entire_listing_display;
          acc.push(apartment);
        } else {
          acc.push({ loginForMore: true });
        }
        return acc;
      }, []);

      const visiblePastSalesApartmentsIDX = visibleActiveRentalsApartments.reduce((acc, apartment) => {
        if ((apartment.status_code != 100 && apartment.sale_or_rental === 'S' && (apartment.rls_idx_display === true &&
          (apartment.vow_address_display === null || apartment.vow_address_display) &&
          (apartment.vow_entire_listing_display === null || apartment.vow_entire_listing_display)))) {
          delete apartment.rls_idx_display;
          delete apartment.vow_address_display;
          delete apartment.vow_entire_listing_display;
          acc.push(apartment);
        } else {
          acc.push({ loginForMore: true });
        }
        return acc;
      }, []);

      const visiblePastRentalsApartmentsIDX = visiblePastRentalsApartments.reduce((acc, apartment) => {
        if ((apartment.status_code != 100 && apartment.sale_or_rental === 'R' && (apartment.rls_idx_display === true &&
          (apartment.vow_address_display === null || apartment.vow_address_display) &&
          (apartment.vow_entire_listing_display === null || apartment.vow_entire_listing_display)))) {
          delete apartment.rls_idx_display;
          delete apartment.vow_address_display;
          delete apartment.vow_entire_listing_display;
          acc.push(apartment);
        } else {
          acc.push({ loginForMore: true });
        }
        return acc;
      }, []);

      apartments = {
        visibleActiveSalesApartments: visibleActiveSalesApartmentsIDX,
        visibleActiveRentalsApartments: visibleActiveRentalsApartmentsIDX,
        visiblePastSalesApartments: visiblePastSalesApartmentsIDX,
        visiblePastRentalsApartments: visiblePastRentalsApartmentsIDX
      }
    } else {
      apartments = { visibleActiveSalesApartments, visibleActiveRentalsApartments, visiblePastSalesApartments, visiblePastRentalsApartments }
    }



    const buildingPicturesArr = await this.listingRepository.createQueryBuilder()
      .select(['image_list_without_floorplans as image_list'])
      .where(`building_id = :buildingId`, { buildingId: buildingDetails.building_id })
      .limit(100)
      .execute();

    const buildingPictures = [].concat.apply([], buildingPicturesArr.map((image) => image.image_list));
    buildingDetails.image_list = buildingPictures.slice(0, 100);

    const location: ILocation = {
      latitude: +buildingDetails.combined_latitude,
      longitude: +buildingDetails.combined_longitude,
    };
    const { pointOfInterest, subwayStations, cityBike } = await this.getExtraInfo(location);

    const breadcrumbs = {
      zip: buildingDetails.zip,
      city: buildingDetails.city,
      place_name: buildingDetails.place_name,
      address: buildingDetails.address,
      building_name: buildingDetails.building_name == '0' ? '' : buildingDetails.building_name,
      building_id: buildingDetails.building_id,
    };

    data = {
      apartments: apartments,
      buildingAmenities: buildingAmenities,
      buildingDetails: buildingDetails,
      pointOfInterest: pointOfInterest,
      subwayStations: subwayStations,
      cityBike: cityBike,
      breadcrumbs: breadcrumbs,
    };

    this.redisServiceAdapter.setWithExp(`${logged}_${type}_${search.replace(/ /g, '-')}`, JSON.stringify(data), 'EX', 60 * 60 * 3);

    return data;
  }

  public async getExtraInfo(location) {

    const pointOfInterest = await this.openDataApisService.getPointOfInterest(
      location
    );
    const subwayStations = await this.openDataApisService.getSubwayStation(
      location
    );
    const cityBike = []; // await this.openDataApisService.getCityBike(location);

    return { pointOfInterest, subwayStations, cityBike };
  }

  private parseNullandBoolean(obj: any) {
    Object.keys(obj).forEach((key) => {
      if (obj[key] === 'null') {
        obj[key] = null;
      } else if (obj[key] === 'undefined') {
        obj[key] = undefined;
      } else if (obj[key] === 'true') {
        obj[key] = true;
      } else if (obj[key] === 'false') {
        obj[key] = false;
      }
    })
    return obj;
  }
  // public async getXmlDataFromPerchwell(): Promise<Object> {
  //   let arr = [1];

  //   let result: Object[] = [];
  //   for await (let el of arr) {
  //     const data = await this.perchwellService.fetchDataFromPerchwell(
  //       '',
  //       result.length
  //     );
  //     const listing = data['RETS'].Listing;
  //     listing.forEach((el) => {
  //       let listingEntity = new ListingEntity();
  //       listingEntity = plainToClass(
  //         ListingEntity,
  //         this.convertPerchwellDataToObject(el)
  //       );
  //       try {
  //         listingEntity.save();
  //       } catch (e) {
  //         throw new BadRequestException(
  //           ERRORS_CONSTANTS.DB[e.code]('ListingEntity')
  //         );
  //       }
  //     });
  //     result = [...result, ...data];
  //     if (data.length) {
  //       arr.push(el + 1);
  //     }
  //   }
  //   return result.length;
  // }

  // private convertPerchwellDataToObject(el: Object) {
  //   let jsonObj = JSON.parse(JSON.stringify(el));
  //   delete jsonObj['ImageListLarge'];
  //   delete jsonObj['ImageListOriginal'];
  //   delete jsonObj['ImageListWithoutFloorplans'];
  //   delete jsonObj['FloorPlanList'];
  //   let jsonStr = JSON.stringify(jsonObj);
  //   jsonStr = jsonStr.replace(/[\[\]']+/g, '');
  //   try {
  //     jsonObj = JSON.parse(jsonStr);
  //   } catch (e) {
  //     console.log(e);
  //   }

  //   jsonObj['ImageListLarge'] = el['ImageListLarge'];
  //   jsonObj['ImageListOriginal'] = el['ImageListOriginal'];
  //   jsonObj['ImageListWithoutFloorplans'] = el['ImageListWithoutFloorplans'];
  //   jsonObj['FloorPlanList'] = el['FloorPlanList'];
  //   jsonObj['PerchwellId'] = +el['Id'];

  //   return jsonObj;
  // }
}
