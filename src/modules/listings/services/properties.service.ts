import { BadRequestException, Injectable, Logger, Scope } from "@nestjs/common";
import { PropertyRepository } from "../repositories/Properties.repository";
import { TrestleService } from "../../../libs/tretsle/trestle.service";
import { PropertyEntity } from "../entities/Property.entity";
import { plainToClass } from "class-transformer";
import { ListingsRepository } from "../repositories/Listings.repository";
import { ListingEntity } from "../entities/Listing.entity";
import { AutosuggestionSearchDto } from "../dto/AutosuggestionSearchDto";
import { UserDto } from "../../users/dto/User.dto";
import { RedisServiceAdapter } from "../../../shared/redis-adapter/redis-adapter.service";
import * as fs from 'fs';
import { QueryFilter } from "../dto/QueryFilterDto";
import { Users } from "../../users/entities/Users.entity";
import { UserStorage } from "../../users/entities/UserStorage.entity";
import { ILocation } from "../../../shared/interfaces/location.interface";
import { OpenDataApisService } from "../../other-apis/services/open-data-apis.service";
import { ScheduledViewing } from "../../users/entities/ScheduledViewing.entity";
import { OpenHouseEntity } from "../entities/OpenHouse.entity";
import { UpdateCoordinatesDto } from "../dto/UpdateCoordinatesDto";
import { MapsLocationService } from "../../../libs/maps-location/maps-location.service";
import { Autosuggestion, AutosuggestionType } from "../entities/Autosuggestion.entity";
import { AutosuggestionRepository } from "../repositories/Autosuggestion.repository";
import { UtilityService } from "../../../providers/utility.service";

@Injectable({ scope: Scope.REQUEST })
export class PropertiesService {
  private readonly logger = new Logger(PropertiesService.name);

  constructor(
    private readonly propertiesRepository: PropertyRepository,
    public readonly listingRepository: ListingsRepository,
    private readonly autosuggestionRepository: AutosuggestionRepository,
    private readonly trestleService: TrestleService,
    private readonly mapsLocationService: MapsLocationService,
    private readonly redisServiceAdapter: RedisServiceAdapter,
    private readonly openDataApisService: OpenDataApisService,
    private readonly utilityService: UtilityService
  ) { }

  public async findOne(query: object): Promise<PropertyEntity> {
    return await this.propertiesRepository.findOne(query);
  }

  public async saveData(user: Users, req?: any) {
    //if (user.email.indexOf('cvetanovski.martin') === -1) return 'everything is ok';
    this.logger.log('Running saveData');
    (async () => {
      let data: any;
      let totalReq = req?.totalReq || 0;

      if (!req) {
        data = await this.trestleService.fetchListingMedia({ endpoint: this.trestleService.endpoints.pagination });
      } else {
        const { url, token } = req;
        data = await this.trestleService.fetchListingMedia({ url, token });
      }
      const properties = [];
      for (let i = 0; i < data.value.length; i++) {
        let property = data.value[i];

        if (!property.UnparsedAddress) continue;

        let propertyEntity = PropertyEntity.fromDtoToEntity(property);
        properties.push(propertyEntity)
      }

      try {
        await this.propertiesRepository.createQueryBuilder()
          .insert()
          .values(properties)
          .orUpdate({
            overwrite: ["BuildingKey", ...this.utilityService.getPopulatedColumns()],
            conflict_target: ["ListingKey", "ListingId"]
          })
          .execute();

        await this.updateCoordinatesFromDBCron();
        await this.createUpdateAutosuggestions(properties);
      } catch (e) {
        this.logger.error(e);
      }

      if (data['@odata.nextLink']) {
        totalReq++;
        await this.saveData(user, { url: data['@odata.nextLink'], totalReq })
      } else {
        await this.createUpdateAutosuggestions();
        console.log(`Total requests: ${totalReq}`);
      }
    })()

    return 'ok'
  }

  public async fetchMissingCoordinates(): Promise<any> {
    this.logger.log('Running fetchMissingCoordinates');
    const propertiesQuery = this.propertiesRepository.createQueryBuilder('pr')
      .select([`pr."UnparsedAddress" as address`])
      .where(`pr."Latitude" is null and pr."Longitude" is null`)
      .andWhere(`pr."StandardStatus" = 'Active'`)
      .groupBy('pr.UnparsedAddress');
    const coordinates = await propertiesQuery.getRawMany();

    return coordinates
  }

  // public async saveOpenHouseData(req?: any) {
  //   let data: any;
  //   let totalReq = req?.totalReq || 0;
  //   if (!req) {
  //     data = await this.trestleService.fetchListingMedia({ endpoint: this.trestleService.endpoints.openHousePagination });
  //   } else {
  //     const { url, token } = req;
  //     data = await this.trestleService.fetchListingMedia({ url, token });
  //   }

  //   for (let i = 0; i < data.value.length; i++) {
  //     let openHouseEntity = new OpenHouseEntity();
  //     let openHouse = data.value[i];
  //     Object.keys(openHouse).forEach((key) => {
  //       if (!openHouse[key]) delete openHouse[key];
  //     });

  //     openHouseEntity = plainToClass(OpenHouseEntity, openHouse);

  //     try {
  //       await openHouseEntity.save();
  //     } catch (e) {
  //       this.logger.log(data.value[i]);
  //       this.logger.log(`error in saveOpenHouseData with code ${e.code}`)
  //     }
  //   }

  //   if (data['@odata.nextLink']) {
  //     totalReq++;
  //     await this.saveData(urer{ url: data['@odata.nextLink'], totalReq })
  //   } else {
  //     return totalReq
  //   }
  // }

  public async fetchPropertyByFilter(filter: any): Promise<any> {
    const data = await this.trestleService.fetchListingMedia({ endpoint: this.trestleService.endpoints.customFilter(filter.filterType, filter.filterValue) });
    const properties = [];
    for (let i = 0; i < data.value.length; i++) {
      let property = data.value[i];

      if (!property.UnparsedAddress) continue;

      let propertyEntity = PropertyEntity.fromDtoToEntity(property);

      properties.push(propertyEntity)

      await this.updateAutosuggestion(propertyEntity);
    }

    try {
      await this.propertiesRepository.createQueryBuilder()
        .insert()
        .values(properties)
        .orUpdate({
          overwrite: this.utilityService.getPopulatedColumns(),
          conflict_target: ["ListingKey", "ListingId"]
        })
        .execute();
    } catch (e) {
      this.logger.error(e);
    }

  }

  // @Cron(CronExpression.EVERY_DAY_AT_3AM)
  public async updateCoordinatesFromDBCron(): Promise<string> {
    this.logger.log('Started updating coordinates from DB by address and zip');
    let propertiesWithoutCoordinates: PropertyEntity[] = await this.propertiesRepository.query(`select 
      "ListingKey", 
      lower("UnparsedAddress") as "UnparsedAddress", 
      lower("StreetName") as "StreetName",
      lower("StreetNumber") as "StreetNumber", 
      "UnitNumber", 
      "PostalCode", 
      "SubdivisionName", 
      "CityRegion"
      from property_entity 
      where "Latitude" is null 
      and "Longitude" is null;`);

    let chunkArray = this.utilityService.chunkArray(propertiesWithoutCoordinates, 500);

    let total = 0;
    for (let j = 0; j < chunkArray.length; j++) {
      let withoutCoordinates = chunkArray[j];
      let queryUpdate = [];
      for (let i = 0; i < withoutCoordinates.length; i++) {
        let property = withoutCoordinates[i];

        let listingQuery = `select longitude, latitude from location_entity 
        where (lower(address) like '%${property.StreetNumber.toLowerCase()}%${property.StreetName.toLowerCase()}%'
        OR lower(address) like '%${property.StreetName.toLowerCase()}%${property.StreetNumber.toLowerCase()}%') and postal_code = '${property.PostalCode}'`;

        let addressesWithCoordinates = await this.propertiesRepository.query(listingQuery);

        if (addressesWithCoordinates.length) {
          queryUpdate.push(`update property_entity set "Latitude" = ${addressesWithCoordinates[0].latitude}, "Longitude" = ${addressesWithCoordinates[0].longitude} where "ListingKey" = '${property.ListingKey}';`)
        } else {
          listingQuery = `select longitude, latitude from location_entity 
              where (lower(address) like '%${property.StreetNumber.toLowerCase()}%${property.StreetName.toLowerCase()}%'
              OR lower(address) like '%${property.StreetName.toLowerCase()}%${property.StreetNumber.toLowerCase()}%')`;

          let addressesWithCoordinates = await this.propertiesRepository.query(listingQuery);
          if (addressesWithCoordinates.length) {
            queryUpdate.push(`update property_entity set "Latitude" = ${addressesWithCoordinates[0].latitude}, "Longitude" = ${addressesWithCoordinates[0].longitude} where "ListingKey" = '${property.ListingKey}';`)
          } else {
            listingQuery = `select longitude, latitude from location_entity 
            where (lower(address) like '%${property.StreetName.toLowerCase()}%'
            OR lower(address) like '%${property.StreetName.toLowerCase()}%')`;

            let addressesWithCoordinates = await this.propertiesRepository.query(listingQuery);
            if (addressesWithCoordinates.length) {
              queryUpdate.push(`update property_entity set "Latitude" = ${addressesWithCoordinates[0].latitude}, "Longitude" = ${addressesWithCoordinates[0].longitude} where "ListingKey" = '${property.ListingKey}';`)
            }
          }
        }
      }
      await this.propertiesRepository.query(queryUpdate.join(' '));
      total += queryUpdate.length;
      this.logger.log(`Updated ${queryUpdate.length} coordinates from DB by address and zip in chunk ${j + 1}, left ${chunkArray.length - j - 1}`);
    }

    this.logger.log(`Updated ${total} coordinates from DB by address and zip`);
    this.logger.log('Finished updating coordinates from DB by address and zip');
    return 'ok'
  }

  // @Cron(CronExpression.EVERY_12_HOURS)
  public async updateCoordinatesFromMapQuestCron(): Promise<string> {
    this.logger.log('Running updateCoordinatesFromMapQuestCron');
    const propertiesQuery = this.propertiesRepository.createQueryBuilder('pr')
      .select([`pr."UnparsedAddress" as address`])
      .where(`pr."Latitude" is null and pr."Longitude" is null`)
      .andWhere(`pr."StandardStatus" = 'Active'`)
      .groupBy('pr.UnparsedAddress');
    const coordinates = await propertiesQuery.getRawMany();
    let count = 0;
    for (let i = 0; i < coordinates.length; i++) {
      const body = { location: `${coordinates[i].address},NewYork,NY` }
      const coordinatesData = (await this.mapsLocationService.mapQuestFetchCoordinates(body)) as any;
      if (!coordinatesData) continue;
      const data = {
        Longitude: coordinatesData.lng,
        Latitude: coordinatesData.lat
      } as Partial<PropertyEntity>
      count++;
      await this.propertiesRepository.update({ UnparsedAddress: coordinates[i].address }, data);
    }
    this.logger.log(`Updated ${count} coordinates`);
    return 'ok'
  }

  public async updateCoordinates(properties: UpdateCoordinatesDto[]): Promise<void> {
    this.logger.log('Running updateCoordinates');
    const queryUpdate = [];
    properties.forEach((property) => {
      queryUpdate.push(`update property_entity set "Latitude" = '${property.latitude}', "Longitude" = '${property.longitude}' where "ListingKey" = '${property.id}'`)
    });
    await this.propertiesRepository.query(queryUpdate.join(' '));
  }

  public async autocompleteSearch(
    search?: string,
    saleOrRental?: string,
    user?: UserDto
  ): Promise<AutosuggestionSearchDto[]> {
    let logged = 'logged';
    if (typeof user === 'object') {
      logged = 'logged'
    } else {
      logged = 'not_logged'
    }

    // const newYork = JSON.parse(fs.readFileSync('./assets/new-york-places.json', 'utf8'));
    // const mainPlaces = Object.keys(newYork);
    // const places = Object.values(newYork) as any[];
    // const allPlaces = [...mainPlaces, ...places.flat(Infinity)];

    const regex = new RegExp("\\bSt\\b", "i");
    search = search.trim().toLowerCase();

    // if (search.match(regex)) {
    //   search = search.split('st').join('street');
    //   search = search.split('st.').join('street');
    // }

    let querySearch = search.split(' ').join(' & ');

    // let queryBuilder = this.autosuggestionRepository.createQueryBuilder()
    //   .select(['name', 'building_key', 'listing_key', 'status'])
    //   .addSelect(`
    //   CASE 
    //     WHEN type = '1'::autosuggestion_type_enum then 'Places'
    //     WHEN type = '2'::autosuggestion_type_enum then 'Address'
    //     WHEN type = '3'::autosuggestion_type_enum then 'Buildings'
    //     WHEN type = '4'::autosuggestion_type_enum then 'FullAddress'
    //     WHEN type = '5'::autosuggestion_type_enum then 'Zip'
    //     WHEN type = '6'::autosuggestion_type_enum then 'City'
    //     WHEN type = '7'::autosuggestion_type_enum then 'Region'
    //     end AS "type" 
    //   `)
    // queryBuilder.where(`name_vector @@ to_tsquery(:querySearch)`, { querySearch });

    // let data = await queryBuilder.getRawMany();

    let data = await this.autosuggestionRepository
      .createQueryBuilder()
      .select(['name', 'building_key', 'listing_key', 'status', 'full_name', '"salesOrRental"'])
      .addSelect(`
  CASE 
    WHEN type = '1'::autosuggestion_type_enum then 'Places'
    WHEN type = '2'::autosuggestion_type_enum then 'Address' 
    WHEN type = '3'::autosuggestion_type_enum then 'Buildings'
    WHEN type = '4'::autosuggestion_type_enum then 'FullAddress'
    WHEN type = '5'::autosuggestion_type_enum then 'Zip'
    WHEN type = '6'::autosuggestion_type_enum then 'City'
    WHEN type = '7'::autosuggestion_type_enum then 'Region'
    end AS "type"
  `)
      .where(`(
      (type = '4'::autosuggestion_type_enum AND status = 'Active') 
      OR 
      type <> '4'::autosuggestion_type_enum
    )`)
      .andWhere(`(
      name ILIKE :term OR
      name % :term OR
      name_vector @@ plainto_tsquery('english', :tsTerm)
    )`, {
        term: `%${querySearch}%`,
        tsTerm: `${querySearch}:*`
      })
      .orderBy(`(
        COALESCE(similarity(name, :similarityTerm), 0) * 0.5 +
        ts_rank(name_vector, plainto_tsquery('english', :tsTerm))
      )`, 'DESC')
      .setParameters({
        similarityTerm: querySearch,
        tsTerm: `${querySearch}:*`
      })
      // .limit(10)
      .getRawMany();

    const seenBuildingKeys = new Set();
    const seenListingKeys = new Set();
    const seenNames = new Set();
    const uniqueArray = [];

    data.forEach(item => {
      const lowerCaseName = item.name.toLowerCase();

      // Check for unique building_key if it exists and is not null
      if (item.building_key && !seenBuildingKeys.has(item.building_key)) {
        seenBuildingKeys.add(item.building_key);
        seenNames.add(lowerCaseName);
        uniqueArray.push(item);
      }
      // Check for unique listing_key if it exists and is not null
      else if (item.listing_key && !seenListingKeys.has(item.listing_key)) {
        seenListingKeys.add(item.listing_key);
        seenNames.add(lowerCaseName);
        uniqueArray.push(item);
      }
      // Check for unique name if both building_key and listing_key are null
      else if (!item.building_key && !item.listing_key && !seenNames.has(lowerCaseName)) {
        seenNames.add(lowerCaseName);
        uniqueArray.push(item);
      }
    });

    data = uniqueArray;

    const responseObj = {}
    data.forEach(element => {
      switch (element.type) {
        case 'Places':
          const place = element.name.toLowerCase();
          if (!responseObj[place]) {
            responseObj[place] = { type: element.type, place_name: element.full_name || element.name }
          }
          break;
        case 'Region':
          const region = element.name.toLowerCase();
          if (!responseObj[region]) {
            responseObj[region] = { type: element.type, region: element.full_name || element.name }
          }
          break;
        case 'Zip':
          if (!responseObj[element.name.toLowerCase()]) {
            responseObj[element.name] = { type: element.type, zip: element.full_name || element.name }
          }
          break;
        case 'City':
          if (!responseObj[element.name.toLowerCase()]) {
            responseObj[element.name] = { type: element.type, city: element.full_name || element.name }
          }
          break;
        case 'Buildings':
          if (!responseObj[element.name.toLowerCase()]) {
            responseObj[element.name.toLowerCase()] = { type: element.type, building_name: element.full_name, building_key: element.building_key }
          } else {
            responseObj[element.name.toLowerCase()].building_name = element.full_name;
          }
          break;
        case 'Address':
          if (!responseObj[element.name.toLowerCase()]) {
            responseObj[element.name.toLowerCase()] = { type: 'Buildings', address: element.full_name, building_key: element.building_key }
          } else {
            responseObj[element.name.toLowerCase()].address = element.full_name;
          }
          break;
        case 'FullAddress':
          if (((typeof user === 'object') || element.status === 'Active') && element.salesOrRental === saleOrRental) {
            if (!responseObj[element.listing_key]) {
              responseObj[element.listing_key] = { type: 'Address', address: element.full_name, apartment_key: element.listing_key }
            }
          }
          break;
      }
    });

    // for (let place of allPlaces) {
    //   if (place.toLowerCase().indexOf(search) > -1) {
    //     responseObj[place] = { type: 'Places', place_name: place }
    //   }
    // }

    const dataReturn = Object.values(responseObj) as AutosuggestionSearchDto[];

    return dataReturn;
  }

  public async searchBy(query: QueryFilter, user: Users): Promise<any> {
    let queryFilter: QueryFilter = query;
    queryFilter = this.parseNullandBoolean(queryFilter);

    if (!queryFilter.salesOrRental || queryFilter.salesOrRental === 'S') {
      queryFilter.salesOrRental = ['Residential', 'ResidentialSale', 'Commercial', 'CommercialSale']
    } else {
      queryFilter.salesOrRental = ['ResidentialLease', 'CommercialLease']
    }

    let propertyType = ''
    queryFilter.salesOrRental.forEach((sr: string) => {
      propertyType += ` pe."PropertyType" = '${sr}' OR`
    })
    propertyType = propertyType.slice(0, -2);

    let logged = 'logged';
    if (typeof user === 'object') {
      logged = 'logged'
    } else {
      logged = 'not_logged'
    }


    const newYork = JSON.parse(fs.readFileSync('./assets/new-york-places.json', 'utf8'));

    // const placeses = !newYork[queryFilter.search] ? [] : newYork[queryFilter.search];
    // const childrenPlaces = placeses.reduce((acc, place) => {
    //   if (newYork[place]) {
    //     acc = [...acc, ...newYork[place].map((lower) => lower.toLowerCase())];
    //   }
    //   return acc;
    // }, [])
    // const placesesInclude = childrenPlaces.length > 0 ? childrenPlaces : placeses.map((place) => place.toLowerCase())


    let searchQuery: string[] = [`pe."ListingKey" as id`, `pe."City" as city`, `pe."BuildingKey"`]

    if (typeof user === 'object') {
      searchQuery.push(`case 
      when us.id is not null then true
      else false
      end as saved_data`);
    }

    searchQuery = [...searchQuery, `array["MediaURL"[1]] as image_list`, `pe."TaxAnnualAmount" as tax`, `pe."AssociationFee" as fee`,
      `pe."ListPrice" as listing_price`, `pe."UnparsedAddress" as address`, `pe."BuildingName" as building_name`,
      `(coalesce(pe."UnparsedAddress", '') || ' ' || coalesce(pe."UnitNumber", '')) as address_with_unit`, `pe."Latitude" as combined_latitude`,
      `pe."Longitude" as combined_longitude`, `pe."BedroomsTotal" as num_bedrooms`, `pe."BathroomsTotalInteger" as num_baths`,
      `pe."LotSizeArea" as sqft`, `pe."SubdivisionName" as place_name`, `pe."CityRegion" as region`, `pe."ListingContractDate" as list_date`];

    let queryBuilder = this.propertiesRepository.createQueryBuilder('pe')
      .select(searchQuery)

    queryBuilder = queryBuilder.where(`(pe."StandardStatus" = 'Active')`);
    switch (queryFilter.type) {
      case 'Places':
        queryBuilder.andWhere(`lower(pe."SubdivisionName") = :search `, { search: `${queryFilter.search.toLowerCase()}` });
        break;
      case 'Region':
        queryBuilder.andWhere(`lower(pe."CityRegion") = :search`, { search: `${queryFilter.search.toLowerCase()}` });
        break;
      case 'Cities':
        queryBuilder.andWhere(`lower(pe."City") = :search`, { search: `${queryFilter.search.toLowerCase()}` });
        break;
      case 'Zip':
        queryBuilder.andWhere(`lower(pe."PostalCode") = :search`, { search: `${queryFilter.search.toLowerCase()}` })
        break;
    }

    queryBuilder.andWhere(`pe."Latitude" is not null`);
    queryBuilder.andWhere(`pe."Longitude" is not null`);

    if (typeof user === 'object') {
      queryBuilder = queryBuilder.leftJoin(UserStorage, 'us', `us."userId" = :id and us."listing_key" = pe."ListingKey"`, { id: `${user.id}` })
    } else {
      queryBuilder = queryBuilder.andWhere(`(pe."Permission" like '%IDX%' OR pe."Permission" = 'Public')`);
    }

    if (queryFilter.propertyType) {
      if (queryFilter.propertyType.split(',').length > 0) {
        const propertySubType = queryFilter.propertyType.split(',');
        propertySubType.forEach((type) => {
          queryBuilder.andWhere(`pe."PropertySubType" = :propertyType`, { propertyType: type });
        });
      }
    }

    if (queryFilter.bathroomsFrom || queryFilter.bathroomsTo) {
      let query = ``;
      if (queryFilter.bathroomsFrom && !queryFilter.bathroomsTo) {
        query = `(pe."BathroomsTotalInteger" >= :bathroomsFrom)`
      } else if (!queryFilter.bathroomsFrom && queryFilter.bathroomsTo) {
        if (queryFilter.bathroomsTo == 4) {
          query = `(pe."BathroomsTotalInteger" >= :bathroomsTo)`
        } else {
          query = `(pe."BathroomsTotalInteger" <= :bathroomsTo)`
        }
      } else {
        if (queryFilter.bathroomsTo == 4) {
          query = `(pe."BathroomsTotalInteger" >= :bathroomsFrom and pe."BathroomsTotalInteger" >= :bathroomsTo)`
        } else {
          query = `(pe."BathroomsTotalInteger" >= :bathroomsFrom and pe."BathroomsTotalInteger" <= :bathroomsTo)`
        }
      }
      queryBuilder.andWhere(query, { bathroomsFrom: +queryFilter.bathroomsFrom, bathroomsTo: +queryFilter.bathroomsTo })
    }

    if (queryFilter.bedroomsFrom || queryFilter.bedroomsTo) {
      let query = ``;
      if (queryFilter.bedroomsFrom && !queryFilter.bedroomsTo) {
        query = `(pe."BedroomsTotal" >= :bedroomsFrom)`
      } else if (!queryFilter.bedroomsFrom && queryFilter.bedroomsTo) {
        if (queryFilter.bathroomsTo == 4) {
          query = `(pe."BedroomsTotal" >= :bedroomsTo)`
        } else {
          query = `(pe."BedroomsTotal" <= :bedroomsTo)`
        }
      } else {
        if (queryFilter.bedroomsTo == 4) {
          query = `(pe."BedroomsTotal" >= :bedroomsFrom and pe."BedroomsTotal" >= :bedroomsTo)`
        } else {
          query = `(pe."BedroomsTotal" >= :bedroomsFrom and pe."BedroomsTotal" <= :bedroomsTo)`
        }
      }
      queryBuilder.andWhere(query, { bedroomsFrom: +queryFilter.bedroomsFrom, bedroomsTo: +queryFilter.bedroomsTo })
    }

    if (queryFilter.priceFrom || queryFilter.priceTo) {
      let query = ``;
      if (queryFilter.priceFrom && !queryFilter.priceTo) {
        query = `(pe."ListPrice" >= :priceFrom)`
      } else if (!queryFilter.priceFrom && queryFilter.priceTo) {
        query = `(pe."ListPrice" <= :priceTo)`
      } else {
        query = `(pe."ListPrice" >= :priceFrom and pe."ListPrice" <= :priceTo)`
      }

      queryBuilder.andWhere(query, { priceFrom: +queryFilter.priceFrom, priceTo: +queryFilter.priceTo });
    }

    // if (queryFilter.priceSqfFrom || queryFilter.priceSqfTo) {
    //   let query = ``;
    //   if (queryFilter.priceSqfFrom && !queryFilter.priceSqfTo) {
    //     query = `(ls.listing_price_per_sqft >= :priceSqfFrom)`
    //   } else if (!queryFilter.priceSqfFrom && queryFilter.priceSqfTo) {
    //     query = `(ls.listing_price_per_sqft <= :priceSqfTo)`
    //   } else {
    //     query = `(ls.listing_price_per_sqft >= :priceSqfFrom and ls.listing_price_per_sqft <= :priceSqfTo)`
    //   }
    //   queryBuilder.andWhere(query, { priceSqfFrom: +queryFilter.priceSqfFrom, priceSqfTo: +queryFilter.priceSqfTo })
    // }

    if (queryFilter.totalRoomsFrom || queryFilter.totalRoomsTo) {
      let query = ``;
      if (queryFilter.totalRoomsFrom && !queryFilter.totalRoomsTo) {
        query = `(pe."RoomsTotal" >= :totalRoomsFrom)`
      } else if (!queryFilter.totalRoomsFrom && queryFilter.totalRoomsTo) {
        query = `(pe."RoomsTotal" <= :totalRoomsTo)`
      } else {
        query = `(pe."RoomsTotal" >= :totalRoomsFrom and pe."RoomsTotal" <= :totalRoomsTo)`
      }
      queryBuilder.andWhere(query, { totalRoomsFrom: +queryFilter.totalRoomsFrom, totalRoomsTo: +queryFilter.totalRoomsTo })
    }

    if (queryFilter.sqftFrom || queryFilter.sqftTo) {
      let query = ``;
      if (queryFilter.sqftFrom && !queryFilter.sqftTo) {
        query = `(pe."LivingArea" >= :sqftFrom)`
      } else if (!queryFilter.sqftFrom && queryFilter.sqftTo) {
        query = `(pe."LivingArea" <= :sqftTo)`
      } else {
        query = `(pe."LivingArea" >= :sqftFrom and pe."LivingArea" <= :sqftTo)`
      }
      queryBuilder.andWhere(query, { sqftFrom: +queryFilter.sqftFrom, sqftTo: +queryFilter.sqftTo })
    }

    if (queryFilter.yearBuiltFrom || queryFilter.yearBuiltTo) {
      let query = ``;
      if (queryFilter.yearBuiltFrom && !queryFilter.yearBuiltTo) {
        query = `(pe."YearBuilt" >= :yearBuiltFrom)`
      } else if (!queryFilter.yearBuiltFrom && queryFilter.yearBuiltTo) {
        query = `(pe."YearBuilt" <= :yearBuiltTo)`
      } else {
        query = `(pe."YearBuilt" >= :yearBuiltFrom and pe."YearBuilt" <= :yearBuiltTo)`
      }
      queryBuilder.andWhere(query, { yearBuiltFrom: +queryFilter.yearBuiltFrom, yearBuiltTo: +queryFilter.yearBuiltTo })
    }

    if (queryFilter.doorman) {
      queryBuilder.andWhere(`pe."SecurityFeatures" like '%DoorMan%'`);
    }

    if (queryFilter.gym) {
      queryBuilder.andWhere(`pe."CommunityFeatures" like '%FitnessCenter%'`);
    } else {
      if (queryFilter.gym === false) {
        queryBuilder.andWhere(`pe."CommunityFeatures" not like '%FitnessCenter%'`);
      }
    }

    if (queryFilter.garage) {
      queryBuilder.andWhere(`pe."GarageYN" = true`);
    } else {
      if (queryFilter.garage === false) {
        queryBuilder.andWhere(`pe."GarageYN" = false and pe."GarageYN" is null`);
      }
    }

    if (queryFilter.pool) {
      queryBuilder.andWhere(`(pe."PoolPrivateYN" = true and pe."PoolFeatures" is not null)`);
    } else {
      if (queryFilter.pool === false) {
        queryBuilder.andWhere(`(pe."PoolPrivateYN" = false or pe."PoolPrivateYN" is null)`);
      }
    }

    if (queryFilter.elevator) {
      queryBuilder.andWhere(`pe."ElevatorsTotal" > 0`);
    } else {
      if (queryFilter.elevator === false) {
        queryBuilder.andWhere(`(pe."ElevatorsTotal" = 0 and pe."ElevatorsTotal" is null)`);
      }
    }

    if (queryFilter.pets) {
      queryBuilder.andWhere(`(pe."PetsAllowed" is not null and pe."PetsAllowed" != 'No')`);
    } else {
      if (queryFilter.pets === false) {
        queryBuilder.andWhere(`pe."PetsAllowed" != 'No'`);
      }
    }

    if (queryFilter.washerDayer) {
      queryBuilder.andWhere(`(pe."Appliances" like '%Dryer%' OR pe."Appliances" like '%WasherDryerAllowed%' OR pe."Appliances" like '%Washer%')`);
    }

    if (queryFilter.prewar) {
      queryBuilder.andWhere(`pe."ArchitecturalStyle" like '%Prewar%'`);
    }

    if (queryFilter.rooftop) {
      queryBuilder.andWhere(`pe."PatioAndPorchFeatures" like '%Rooftop%'`);
    }

    if (queryFilter.outdorSpace) {
      queryBuilder.andWhere(`pe."PatioAndPorchFeatures" is not null`);
    }

    if (queryFilter.buildingLaundry) {
      queryBuilder.andWhere(`pe."LaundryFeatures" is not null`);
    }

    if (queryFilter.newDevelopment) {
      queryBuilder.andWhere(`pe."NewDevelopmentYN" = true`);
    } else {
      if (queryFilter.newDevelopment === false) {
        queryBuilder.andWhere(`pe."NewDevelopmentYN" = false`);
      }
    }
    queryBuilder.andWhere(`(${propertyType})`);

    queryBuilder.distinctOn(['pe."ListingKey"']);
    queryBuilder.limit(300);
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

    const minMaxQuery = [`MIN(pe."ListPrice") AS min`, `MAX(pe."ListPrice") AS max`]

    let queryBuilderMinMax = this.propertiesRepository.createQueryBuilder('pe').select(minMaxQuery);
    queryBuilderMinMax = queryBuilderMinMax.where(`(pe."StandardStatus" = 'Active')`);
    switch (queryFilter.type) {
      case 'Places':
        queryBuilderMinMax.andWhere(`lower(pe."SubdivisionName") = :search `, { search: `${queryFilter.search.toLowerCase()}` });
        break;
      case 'Region':
        queryBuilder.andWhere(`lower(pe."CityRegion") = :search`, { search: `${queryFilter.search.toLowerCase()}` });
        break;
      case 'Cities':
        queryBuilderMinMax.andWhere(`lower(pe."City") = :search`, { search: `${queryFilter.search.toLowerCase()}` });
        break;
      case 'Zip':
        queryBuilderMinMax.andWhere(`lower(pe."PostalCode") = :search`, { search: `${queryFilter.search.toLowerCase()}` })
        break;
    }

    queryBuilderMinMax.andWhere(`(${propertyType})`);

    const minMaxPrice = await queryBuilderMinMax.getRawOne();

    let viewedSearch = [];

    if (typeof user === 'object') {
      viewedSearch = [...searchData].slice(0, 2583);
    } else {
      viewedSearch = [...searchData].slice(0, 200);
    }

    const results = {
      totalResults: searchData.length,
      searchData: viewedSearch,
      minMaxPrice: minMaxPrice
    }

    return results;
  }

  public async getById(query: Object, user: Users): Promise<any> {
    const id = query['id'];
    let logged = 'logged';
    if (typeof user === 'object') {
      logged = 'logged'
    } else {
      logged = 'not_logged'
    }

    if (!id) {
      throw new BadRequestException(['listing id missing']);
    }
    let data;

    let queryBuilder = this.propertiesRepository.createQueryBuilder('pe')
      .select([`pe.*`])
      .where(`pe."ListingKey" = :id`, { id })
      .orderBy('pe."date_created"', 'DESC')

    if (typeof user === 'object') {
      queryBuilder = queryBuilder.addSelect([`true as user_loged`]);
      queryBuilder = queryBuilder.addSelect([`case 
      when us.id is not null then true
      else false
      end as saved_data`])
      queryBuilder = queryBuilder.addSelect([`case 
      when sw.id is not null then true
      else false
      end as scheduled_view`]);
      queryBuilder = queryBuilder.addSelect([`sw.scheduled_date as scheduled_date`]);

      queryBuilder = queryBuilder.leftJoinAndSelect(ScheduledViewing, 'sw', `sw.user_id = :userId and sw.listing_key = pe."ListingKey" and sw.canceled = false and sw.scheduled_date >= CURRENT_DATE`, { userId: `${user.id}` })
      queryBuilder = queryBuilder.leftJoinAndSelect(UserStorage, 'us', `us."userId" = :userId and us."listing_key" = pe."ListingKey"`, { userId: `${user.id}` })
    }

    const propertyDetailsDb = (await queryBuilder.getRawMany())[0];

    const saleTypes = ['Residential', 'ResidentialSale', 'Commercial', 'CommercialSale']
    const rentalTypes = ['ResidentialLease', 'CommercialLease']

    let apartmentDetails = {} as any;
    let unitDetails = {} as any;
    let buildingDetails = {} as any;
    let apartmentAmenities = {} as any;
    let buildingAmenities = {} as any;
    if ((typeof user === 'object') || propertyDetailsDb.StandardStatus === 'Active') {

      apartmentDetails.id = id;
      apartmentDetails.building_key = propertyDetailsDb.BuildingKey;
      apartmentDetails.address = propertyDetailsDb.UnparsedAddress;
      apartmentDetails.address_with_unit = propertyDetailsDb.AddressWithUnit;
      apartmentDetails.num_bedrooms = propertyDetailsDb.BedroomsTotal;
      apartmentDetails.num_baths = propertyDetailsDb.BathroomsTotalInteger;
      apartmentDetails.num_rooms = propertyDetailsDb.RoomsTotal;
      apartmentDetails.listing_price = propertyDetailsDb.ListPrice;
      // apartmentDetails.num_units = propertyDetailsDb.NumberOfUnitsTotal;
      apartmentDetails.combined_latitude = propertyDetailsDb.Latitude;
      apartmentDetails.combined_longitude = propertyDetailsDb.Longitude;
      apartmentDetails.sale_or_rental = saleTypes.indexOf(propertyDetailsDb.PropertyType) > -1 ? 'S' : 'R';
      apartmentDetails.place_name = propertyDetailsDb.SubdivisionName;
      apartmentDetails.region = propertyDetailsDb.CityRegion;

      apartmentDetails.city = propertyDetailsDb.City;
      apartmentDetails.zip = propertyDetailsDb.PostalCode;
      apartmentDetails.exposures = propertyDetailsDb.DirectionFaces;

      apartmentDetails.status = propertyDetailsDb.StandardStatus;
      switch (propertyDetailsDb.StandardStatus) {
        case 'Active':
          apartmentDetails.status_code = 100;
          break;
        case 'ActiveUnderContract':
          apartmentDetails.status_code = 240;
          break;
        case 'Canceled':
          apartmentDetails.status_code = 640;
          break;
        case 'Closed':
          apartmentDetails.status_code = 640;
          break;
        case 'ComingSoon':
          apartmentDetails.status_code = 700;
          break;
        case 'Delete':
          apartmentDetails.status_code = 600;
          break;
        case 'Expired':
          apartmentDetails.status_code = 300;
          break;
        case 'Hold':
          apartmentDetails.status_code = 640;
          break;
        case 'Pending':
          apartmentDetails.status_code = 600;
          break;
        case 'Withdrawn':
          apartmentDetails.status_code = 600;
          break;
      }
      apartmentDetails.image_list_without_floorplans = propertyDetailsDb.MediaURL;
      apartmentDetails.sqft = propertyDetailsDb.LivingArea;
      apartmentDetails.listing_price_per_sqft = propertyDetailsDb.ListingPrice / (propertyDetailsDb.LivingArea || 0);
      apartmentDetails.common_interest = propertyDetailsDb.CommonInterest;
      apartmentDetails.floor_plan_list = propertyDetailsDb.FloorPlanMediaURL;
      apartmentDetails.hoa_fee = propertyDetailsDb.AssociationFee;
      apartmentDetails.property_condition = propertyDetailsDb.PropertyCondition;
      // apartmentDetails.real_estate_tax = propertyDetailsDb.BuyerAgencyCompensation;

      // apartmentDetails.total_monthlies = apartmentDetailsDb.total_monthlies;
      // apartmentDetails.flip_tax_description = apartmentDetailsDb.flip_tax_description;
      apartmentDetails.cobroke_agreement = propertyDetailsDb.ListingAgreement;
      apartmentDetails.direction_faces = propertyDetailsDb.DirectionFaces;
      // apartmentDetails.max_financing_pct = apartmentDetailsDb.max_financing_pct;
      apartmentDetails.rebny_id = propertyDetailsDb.OriginatingSystemKey;
      // apartmentDetails.floor_number = propertyDetailsDb.FloorNumber;
      // apartmentDetails.renting_allowed = propertyDetailsDb.RentingAllowedYN; need to defined
      // apartmentDetails.building_class = apartmentDetailsDb.building_class;

      // apartmentDetails.bbl = apartmentDetailsDb.bbl;
      // apartmentDetails.configuration = apartmentDetailsDb.configuration;
      apartmentDetails.furnished = propertyDetailsDb.Furnished;
      apartmentDetails.marketing_description = propertyDetailsDb.PublicRemarks;
      apartmentDetails.brokerage_name = propertyDetailsDb.ListOfficeName;
      apartmentDetails.property_sub_type = propertyDetailsDb.PropertySubType;
      apartmentDetails.fire_place = propertyDetailsDb.FireplacesTotal;

      apartmentDetails.cross_street = propertyDetailsDb.CrossStreet;
      apartmentDetails.lease_term = propertyDetailsDb.LeaseTerm;
      // apartmentDetails.pied_a_terre = propertyDetailsDb.BuildingRules; need to defined
      apartmentDetails.deposit_amount = propertyDetailsDb.DepositAmount;
      apartmentDetails.view = propertyDetailsDb.View;
      apartmentDetails.idx = true;
      apartmentDetails.availability_date = propertyDetailsDb.AvailabilityDate;
      apartmentDetails.association_fee_frequency = propertyDetailsDb.AssociationFeeFrequency;
      apartmentDetails.listing_agreement = propertyDetailsDb.ListingAgreement?.split(/(?=[A-Z])/).join(' ');
      apartmentDetails.pet_policy = propertyDetailsDb.PetsAllowed?.split(/(?=[A-Z])/).join(' ');;
      apartmentDetails.laundry_features = propertyDetailsDb.LaundryFeatures?.split(/(?=[A-Z])/).join(' ');;
      apartmentDetails.furnished = propertyDetailsDb.Furnished?.split(/(?=[A-Z])/).join(' ');;

      if (typeof user === 'object') {
        apartmentDetails.user_loged = propertyDetailsDb.user_loged;
        apartmentDetails.scheduled_date = propertyDetailsDb.scheduled_date;
        apartmentDetails.saved_data = !!propertyDetailsDb.saved_data;
        apartmentDetails.scheduled_view = !!propertyDetailsDb.scheduled_view;
        apartmentDetails.commission_amount = propertyDetailsDb.BuyerAgencyCompensation > 0 ? propertyDetailsDb.BuyerAgencyCompensation : undefined;
        apartmentDetails.commission_type = propertyDetailsDb.RentalCompensationType;
      }

      buildingAmenities = {
        'Accessibility Features': propertyDetailsDb.AccessibilityFeatures ? propertyDetailsDb.AccessibilityFeatures.split(/(?=[A-Z])/).join(' ') : undefined,
        'Parking Features': propertyDetailsDb.ParkingFeatures ? propertyDetailsDb.ParkingFeatures.split(/(?=[A-Z])/).join(' ') : undefined,
        'Patio And Porch Features': propertyDetailsDb.PatioAndPorchFeatures ? propertyDetailsDb.PatioAndPorchFeatures.split(/(?=[A-Z])/).join(' ') : undefined,
        'Community Features': propertyDetailsDb.CommunityFeatures ? propertyDetailsDb.CommunityFeatures.split(/(?=[A-Z])/).join(' ') : undefined,
        'Security Features': propertyDetailsDb.SecurityFeatures ? propertyDetailsDb.SecurityFeatures.split(/(?=[A-Z])/).join(' ') : undefined,
        'Spa Features': propertyDetailsDb.SpaFeatures ? propertyDetailsDb.SpaFeatures.split(/(?=[A-Z])/).join(' ') : undefined,
      }
      if (Object.keys(buildingAmenities).every((key) => !buildingAmenities[key])) buildingAmenities = undefined;

      buildingDetails = {
        building_key: propertyDetailsDb.BuildingKey,
        lot_size: propertyDetailsDb.LotSizeArea ? propertyDetailsDb.LotSizeArea : undefined,
        lot_dimensions: propertyDetailsDb.LotSizeDimensions ? propertyDetailsDb.LotSizeDimensions : undefined,
        total_number_of_units: propertyDetailsDb.NumberOfUnitsTotal ? propertyDetailsDb.NumberOfUnitsTotal : undefined,
        year_built: propertyDetailsDb.YearBuilt ? propertyDetailsDb.YearBuilt : undefined,
        num_stories: propertyDetailsDb.StoriesTotal ? propertyDetailsDb.StoriesTotal : undefined,
        building_name: propertyDetailsDb.building_name ? propertyDetailsDb.building_name : undefined,
      } as any

      apartmentAmenities = {
        'View': propertyDetailsDb.View ? propertyDetailsDb.View.split(/(?=[A-Z])/).join(' ') : undefined,
        'Appliances': propertyDetailsDb.Appliances ? propertyDetailsDb.Appliances.split(/(?=[A-Z])/).join(' ') : undefined,
        'Cooling': propertyDetailsDb.Cooling ? propertyDetailsDb.Cooling.split(/(?=[A-Z])/).join(' ') : undefined,
        'Architectural Style': propertyDetailsDb.ArchitecturalStyle ? propertyDetailsDb.ArchitecturalStyle.split(/(?=[A-Z])/).join(' ') : undefined,
        'Pool Features': propertyDetailsDb.PoolFeatures ? propertyDetailsDb.PoolFeatures.split(/(?=[A-Z])/).join(' ') : undefined,
        'New Development': propertyDetailsDb.NewConstructionYN ? propertyDetailsDb.NewConstructionYN : undefined,
        'Basement': propertyDetailsDb.Basement ? propertyDetailsDb.Basement.split(/(?=[A-Z])/).join(' ') : undefined,
        'Interior Features': propertyDetailsDb.InteriorFeatures ? propertyDetailsDb.InteriorFeatures.split(/(?=[A-Z])/).join(' ') : undefined,
        'Exterior Features': propertyDetailsDb.ExteriorFeatures ? propertyDetailsDb.ExteriorFeatures.split(/(?=[A-Z])/).join(' ') : undefined,
        'Garage': propertyDetailsDb.GarageYN || undefined,

      } as any
      if (Object.keys(apartmentAmenities).every((key) => !apartmentAmenities[key])) apartmentAmenities = undefined;
    } else {
      apartmentDetails = {
        notAllowed: true
      }
      apartmentAmenities = undefined;
      buildingDetails = undefined;
      buildingAmenities = undefined;
    }

    if (apartmentDetails.notAllowed) {
      data = {
        apartmentDetails: apartmentDetails,
      };

      this.redisServiceAdapter.setWithExp(`${logged}_${id}`, JSON.stringify(data), 'EX', 60 * 60 * 3);

      return data;
    }

    const location: ILocation = {
      latitude: +apartmentDetails.combined_latitude,
      longitude: +apartmentDetails.combined_longitude,
    };

    const { pointOfInterest, subwayStations, cityBike } = await this.getExtraInfo(location);

    const breadcrumbs = {
      city: apartmentDetails.city,
      zip: apartmentDetails.zip,
      region: apartmentDetails.region,
      place_name: apartmentDetails.place_name,
      address: apartmentDetails.address,
      building_name: apartmentDetails.building_name || '',
      address_with_unit: apartmentDetails.address_with_unit,
    };

    let similarApartments = []

    if (typeof user === 'object') {
      let propertyType = ''
      let saleOrRental = [];

      if (saleTypes.indexOf(propertyDetailsDb.PropertyType) > -1) {
        saleOrRental = saleTypes;
      } else {
        saleOrRental = rentalTypes
      }

      saleOrRental.forEach((sr: string) => {
        propertyType += `"PropertyType" = '${sr}' OR`
      })

      propertyType = propertyType.slice(0, -2);

      const similarApartmentsQuery = this.propertiesRepository.createQueryBuilder()
        .select([`"ListingKey" as id`, `"ListPrice" as listing_price`, `(coalesce("UnparsedAddress", '') || ' ' || coalesce("UnitNumber", '')) as address_with_unit`,
          `"BedroomsTotal" as beds`, `"BathroomsTotalInteger" as num_baths`, `"LotSizeArea" as sqft`, `"SubdivisionName" as place_name`,
          `array["MediaURL"[1]] as image`])
        .where(`"StandardStatus" = 'Active' and (${propertyType}) and lower("SubdivisionName") like :placeName 
        and "ListingKey" != :id and ("ListPrice" <= :listingPrice or "LotSizeArea" >= :sqft or "BedroomsTotal" >= :bedrooms or "RoomsTotal" >= :rooms)`,
          {
            saleOrRental: `${apartmentDetails.sale_or_rental}`,
            listingPrice: `${apartmentDetails.listing_price ? apartmentDetails.listing_price : 0}`,
            sqft: `${apartmentDetails.sqft ? apartmentDetails.sqft : 0}`,
            placeName: `${apartmentDetails.place_name ? apartmentDetails.place_name.toLowerCase() : ''}`,
            bedrooms: `${apartmentDetails.num_bedrooms ? apartmentDetails.num_bedrooms : 0}`,
            rooms: `${apartmentDetails.num_rooms ? apartmentDetails.num_rooms : 0}`,
            id: `${id}`
          }).limit(15);
      similarApartments = await similarApartmentsQuery.execute();
    }

    data = {
      apartmentDetails: apartmentDetails,
      apartmentAmenities: apartmentAmenities,
      buildingDetails: buildingDetails,
      buildingAmenities: buildingAmenities,
      pointOfInterest: pointOfInterest,
      subwayStations: subwayStations,
      cityBike: cityBike,
      breadcrumbs: breadcrumbs,
      similarApartments: similarApartments,
    };

    // this.redisServiceAdapter.setWithExp(`${logged}_${id}`, JSON.stringify(data), 'EX', 60 * 60 * 3);

    return data;
  }

  public async getBuilding(query: any, user: Users): Promise<any> {
    let type;
    let logged = 'logged';
    const saleTypes = ['Residential', 'ResidentialSale', 'Commercial', 'CommercialSale']
    if (typeof user === 'object') {
      logged = 'logged'
    } else {
      logged = 'not_logged'
    }

    const search = query['search'];

    let data;

    const buildingDetailsQueryBuilder = this.propertiesRepository.createQueryBuilder('pe').select('pe.*')

    if (query.type === 'Buildings') {
      buildingDetailsQueryBuilder.where(`lower("BuildingKey") = :key`, { key: `${search}` });
    } else {
      buildingDetailsQueryBuilder.where(`lower("UnparsedAddress") = :key`, { key: `${search}` });
    }

    if (typeof user === 'object') {
      buildingDetailsQueryBuilder.addSelect([`true as user_loged`]);
      buildingDetailsQueryBuilder.addSelect([`case 
      when us.id is not null then true
      else false
      end as saved_data`])
      buildingDetailsQueryBuilder.addSelect([`case 
      when sw.id is not null then true
      else false
      end as scheduled_view`]);
      buildingDetailsQueryBuilder.addSelect([`sw.scheduled_date as scheduled_date`]);

      buildingDetailsQueryBuilder.leftJoin(ScheduledViewing, 'sw', `sw.user_id = :userId and sw.property_building_key = pe."BuildingKey" and sw.canceled = false and sw.scheduled_date >= CURRENT_DATE`, { userId: `${user.id}` })
      buildingDetailsQueryBuilder.leftJoin(UserStorage, 'us', `us."userId" = :userId and pe."BuildingKey" = us.building_key`, { userId: `${user.id}` })
    }


    buildingDetailsQueryBuilder.distinctOn(['pe."ListingKey"']);

    const buildingDetailsArray = await buildingDetailsQueryBuilder.execute();

    const buildingAmenities = {} as any;
    const buildingDetails = {} as any;
    let apartments = [] as any;

    let accessibilityFeatures = new Set();
    let parkingFeatures = new Set();
    let patioAndPorchFeatures = new Set();
    let communityFeatures = new Set();
    let securityFeatures = new Set();
    let spaFeatures = new Set();
    let garageSpaces = new Set();
    let buildingNames = new Set();
    let petsAllowed = new Set<string>();

    buildingDetailsArray.forEach((apartment: any, i: number) => {

      if (apartment.StandardStatus === 'Active') {
        buildingDetails.num_stories = apartment.StoriesTotal;
        buildingDetails.total_number_of_units = apartment.NumberOfUnitsTotal;
        buildingDetails.lot_size = apartment.LotSizeArea;
      }

      if (i < buildingDetailsArray.length - 1) {
        if (!buildingDetails.num_stories && !buildingDetails.total_number_of_units && !buildingDetails.lot_size) {
          buildingDetails.num_stories = buildingDetailsArray[0].StoriesTotal;
          buildingDetails.total_number_of_units = buildingDetailsArray[0].NumberOfUnitsTotal;
          buildingDetails.lot_size = buildingDetailsArray[0].LotSizeArea;
        }
      }

      if (apartment.ListingService) {
        buildingDetails.listing_service ? buildingDetails.listing_service += apartment.ListingService : buildingDetails.listing_service = apartment.ListingService;
      }

      if (apartment.AccessibilityFeatures) this.parseAmenities(apartment.parkingFeatures).forEach(accessibilityFeatures.add, accessibilityFeatures);
      if (apartment.ParkingFeatures) this.parseAmenities(apartment.ParkingFeatures).forEach(parkingFeatures.add, parkingFeatures);
      if (apartment.PatioAndPorchFeatures) this.parseAmenities(apartment.PatioAndPorchFeatures).forEach(patioAndPorchFeatures.add, patioAndPorchFeatures);
      if (apartment.CommunityFeatures) this.parseAmenities(apartment.CommunityFeatures).forEach(communityFeatures.add, communityFeatures);
      if (apartment.SecurityFeatures) this.parseAmenities(apartment.SecurityFeatures).forEach(securityFeatures.add, securityFeatures);
      if (apartment.spaFeatures) this.parseAmenities(apartment.SpaFeatures).forEach(spaFeatures.add, spaFeatures);
      if (apartment.garageSpaces) this.parseAmenities(apartment.GarageSpaces).forEach(garageSpaces.add, garageSpaces);
      if (apartment.BuildingName) apartment.BuildingName ? (apartment.BuildingName !== 'null' ? buildingNames.add(apartment.BuildingName) : buildingNames.add(apartment.UnparsedAddress)) : '';
      if (apartment.PetsAllowed) this.parseAmenities(apartment.PetsAllowed, 'pets').forEach(petsAllowed.add, petsAllowed);

      apartments.push({
        id: apartment.ListingKey,
        address: apartment.UnparsedAddress,
        address_with_unit: apartment.AddressWithUnit,
        place_name: apartment.SubdivisionName,
        region: apartment.CityRegion,
        building_name: apartment.BuildingName,
        status: apartment.StandardStatus,
        num_baths: apartment.BathroomsTotal,
        num_rooms: apartment.RoomsTotal,
        num_bedrooms: apartment.BedroomsTotal,
        year_built: apartment.YearBuilt,
        property_type: apartment.PropertySubType,
        floor_number: apartment.EntryLevel,
        sale_or_rental: saleTypes.indexOf(apartment.PropertyType) > -1 ? 'S' : 'R',
        listing_price: apartment.ListPrice,
        neighborhood: apartment.CrossStreet,
        sqft: apartment.LotSizeArea,
        image: apartment.MediaURL ? apartment.MediaURL[0] : ''
      })
    })

    buildingAmenities['Accessibility Features'] = accessibilityFeatures.size > 0 ? [...accessibilityFeatures] : undefined;
    buildingAmenities['Parking Features'] = parkingFeatures.size > 0 ? [...parkingFeatures] : undefined;
    buildingAmenities['Patio And Porch Features'] = patioAndPorchFeatures.size > 0 ? [...patioAndPorchFeatures] : undefined;
    buildingAmenities['Community Features'] = communityFeatures.size > 0 ? [...communityFeatures] : undefined;
    buildingAmenities['Security Features'] = securityFeatures.size > 0 ? [...securityFeatures] : undefined;
    buildingAmenities['Spa Features'] = spaFeatures.size > 0 ? [...spaFeatures] : undefined;
    buildingAmenities['Garage Spaces'] = garageSpaces.size > 0 ? [...garageSpaces] : undefined;
    buildingAmenities['Pet Policy'] = petsAllowed.size > 0 ? this.parsePets([...petsAllowed]) : undefined;


    buildingDetails.building_name = [...buildingNames][0];
    buildingDetails.building_key = buildingDetailsArray[0].BuildingKey;
    buildingDetails.address = buildingDetailsArray[0].UnparsedAddress;
    buildingDetails.city = buildingDetailsArray[0].City;
    buildingDetails.zip = buildingDetailsArray[0].PostalCode;
    buildingDetails.place_name = buildingDetailsArray[0].SubdivisionName !== 'null' ? buildingDetailsArray[0].SubdivisionName : undefined;
    buildingDetails.region = buildingDetailsArray[0].CityRegion !== 'null' ? buildingDetailsArray[0].CityRegion : undefined;
    buildingDetails.year_built = buildingDetailsArray[0].YearBuilt;
    buildingDetails.combined_longitude = buildingDetailsArray[0].Longitude;
    buildingDetails.combined_latitude = buildingDetailsArray[0].Latitude;
    buildingDetails.image_list = [].concat.apply([], buildingDetailsArray.map((apartment) => apartment.MediaURL)).slice(0, typeof user === 'object' ? 50 : 3);
    buildingDetails.user_loged = buildingDetailsArray[0].user_loged;
    buildingDetails.saved_data = buildingDetailsArray[0].saved_data;
    buildingDetails.scheduled_view = buildingDetailsArray[0].scheduled_view;
    buildingDetails.scheduled_date = buildingDetailsArray[0].scheduled_date;

    const visibleActiveSalesApartments = apartments.filter((apartment) => {
      return (apartment.status == 'Active' && apartment.sale_or_rental === 'S')
    });

    const visibleActiveRentalsApartments = apartments.filter((apartment) => {
      return (apartment.status == 'Active' && apartment.sale_or_rental === 'R')
    });

    const visiblePastSalesApartments = apartments.filter((apartment) => {
      return (apartment.status != 'Active' && apartment.status != 'ComingSoon' && apartment.sale_or_rental === 'S')
    });

    const visiblePastRentalsApartments = apartments.filter((apartment) => {
      return (apartment.status != 'Active' && apartment.status != 'ComingSoon' && apartment.sale_or_rental === 'R')
    });

    if (!(typeof user === 'object')) {
      // const visiblePastSalesApartmentsIDX = visiblePastSalesApartments.map((apartment: any) => {
      //   apartment.loginForMore = true;
      //   delete apartment.ListingKey;
      //   apartment.address = 'Protected';
      //   apartment.address_with_unit = 'Protected';
      //   apartment.listing_price = 'Protected'
      //   apartment.sqft = 'Protected'
      //   apartment.image = null
      //   return apartment;
      // });

      // const visiblePastRentalsApartmentsIDX = visiblePastRentalsApartments.map((apartment: any) => {
      //   apartment.loginForMore = true;
      //   delete apartment.ListingKey;
      //   apartment.address = 'Protected';
      //   apartment.address_with_unit = 'Protected';
      //   apartment.listing_price = 'Protected'
      //   apartment.sqft = 'Protected'
      //   apartment.image = null
      //   return apartment;
      // });

      apartments = {
        visibleActiveSalesApartments,
        visibleActiveRentalsApartments,
        visiblePastSalesApartments: [],
        visiblePastRentalsApartments: []
      }
    } else {
      apartments = { visibleActiveSalesApartments, visibleActiveRentalsApartments, visiblePastSalesApartments, visiblePastRentalsApartments }
    }

    let skipSimilarBuildings;

    const similarBuildingsQuery = this.propertiesRepository.createQueryBuilder('pe').select('pe.*')
    if (buildingDetails.place_name) {
      similarBuildingsQuery.where(`lower("SubdivisionName") = :key`, { key: `${buildingDetails.place_name.toLowerCase()}` });
    } else if (buildingDetails.region) {
      similarBuildingsQuery.where(`lower("CityRegion") = :key`, { key: `${buildingDetails.region.toLowerCase()}` });
    } else {
      skipSimilarBuildings = true;
    }

    similarBuildingsQuery.andWhere(`"MediaURL" is not null`);
    similarBuildingsQuery.distinctOn(['pe."BuildingKey"']);
    similarBuildingsQuery.limit(15);
    const similarBuildingsArray = !skipSimilarBuildings ? await similarBuildingsQuery.execute() : [];

    const similarBuildings = similarBuildingsArray.reduce((acc, building) => {
      if (building.StandardStatus === 'Active') {
        if (!acc[building.BuildingKey]) {
          acc[building.BuildingKey] = {
            building_key: building.BuildingKey,
            address: building.UnparsedAddress,
            building_name: building.BuildingName,
            img: building.MediaURL[0]
          };
        }
      }

      return acc;
    }, {});

    const location: ILocation = {
      latitude: +buildingDetails.combined_latitude,
      longitude: +buildingDetails.combined_longitude,
    };
    const { pointOfInterest, subwayStations, cityBike } = await this.getExtraInfo(location);

    const breadcrumbs = {
      zip: buildingDetails.zip,
      city: buildingDetails.city,
      region: buildingDetails.region,
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
      similarBuildings: Object.values(similarBuildings),
    };

    return data;
  }

  public async getPropertiesWithoutCoordinates(): Promise<any> {
    const queryBuilder = this.propertiesRepository.createQueryBuilder('pe')
    queryBuilder.select(['pe."UnparsedAddress"', 'pe."Longitude"', 'pe."Latitude"'])
    queryBuilder.where(`(pe."Longitude" is null OR pe."Latitude" is null) AND pe."StandardStatus" = 'Active'`)
    queryBuilder.distinctOn(['pe."UnparsedAddress"'])

    const addresses = await queryBuilder.getRawMany();

    return addresses;
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

  private async createUpdateAutosuggestions(propertyEntities?: PropertyEntity[]) {

    if (propertyEntities) {
      for (let i = 0; i < propertyEntities.length; i++) {
        await this.updateAutosuggestion(propertyEntities[i]);
      }
    } else {
      // Insert City
      await this.autosuggestionRepository.query(`
        INSERT INTO autosuggestion (name, full_name, type)
          SELECT 
             lower("City"),
             "City",
              '6'::autosuggestion_type_enum
          FROM property_entity
          WHERE "City" IS NOT NULL
          GROUP BY "City"
          on conflict (name, type)
          do nothing;	`);

      // Insert Places
      await this.autosuggestionRepository.query(`
        INSERT INTO autosuggestion (name, full_name, type)
          SELECT 
              lower("SubdivisionName"),
              "SubdivisionName",
              '1'::autosuggestion_type_enum
          FROM property_entity
          WHERE "SubdivisionName" IS NOT NULL
          GROUP BY "SubdivisionName"
          on conflict (name, type)
          do nothing;
        `)

      // Insert Zip
      await this.autosuggestionRepository.query(`
          INSERT INTO autosuggestion (name, full_name, type)
            SELECT 
                lower("PostalCode"), 
                "PostalCode",
                '5'::autosuggestion_type_enum
            FROM property_entity
            WHERE "PostalCode" IS NOT NULL
            GROUP BY "PostalCode"
            on conflict (name, type)
            do nothing;
          `)

      // Insert Region
      await this.autosuggestionRepository.query(`
          INSERT INTO autosuggestion (name, full_name, type)
            SELECT 
                lower("CityRegion"),
                "CityRegion",
                '7'::autosuggestion_type_enum
            FROM property_entity
            WHERE "CityRegion" IS NOT NULL
            GROUP BY "CityRegion"
            on conflict (name, type)
            do nothing;
          `)
    }

  }

  private async updateAutosuggestion(propertyEntity: PropertyEntity) {
    // try {
    //   const autosuggestionCity = new Autosuggestion();

    //   autosuggestionCity.name = propertyEntity.City.toLowerCase();
    //   autosuggestionCity.type = AutosuggestionType.CITY;

    //   await autosuggestionCity.save();
    // } catch (e) {
    //   if (e.code !== '23505') {
    //     this.logger.log(`error in updateAutosuggestion with code ${e.code}`)
    //   }
    // }

    // try {
    //   const autosuggestionCity = new Autosuggestion();

    //   autosuggestionCity.name = propertyEntity.SubdivisionName.toLowerCase();
    //   autosuggestionCity.type = AutosuggestionType.PLACE;

    //   await autosuggestionCity.save();
    // } catch (e) {
    //   if (e.code !== '23505') {
    //     this.logger.log(`error in updateAutosuggestion with code ${e.code}`)
    //   }
    // }

    // try {
    //   const autosuggestionCity = new Autosuggestion();

    //   autosuggestionCity.name = propertyEntity.CityRegion.toLowerCase();
    //   autosuggestionCity.type = AutosuggestionType.REGION;

    //   await autosuggestionCity.save();
    // } catch (e) {
    //   if (e.code !== '23505') {
    //     this.logger.log(`error in updateAutosuggestion with code ${e.code}`)
    //   }
    // }

    // try {
    //   const autosuggestionZip = new Autosuggestion();

    //   autosuggestionZip.name = propertyEntity.PostalCode.toLowerCase();
    //   autosuggestionZip.type = AutosuggestionType.ZIP;

    //   await autosuggestionZip.save();
    // } catch (e) {
    //   if (e.code !== '23505') {
    //     this.logger.log(`error in updateAutosuggestion with code ${e.code}`)
    //   }
    // }

    try {
      const autosuggestionAddress = new Autosuggestion();
      autosuggestionAddress.name = `${propertyEntity.StreetNumber.toLowerCase()} ${propertyEntity.StreetName.toLowerCase()}`;
      autosuggestionAddress.full_name = `${propertyEntity.StreetNumber} ${propertyEntity.StreetName}`;
      autosuggestionAddress.type = AutosuggestionType.ADDRESS;
      autosuggestionAddress.building_key = propertyEntity.BuildingKey;
      await autosuggestionAddress.save();
    } catch (e) {
      if (e.code !== '23505') {
        this.logger.log(`error in updateAutosuggestion with code ${e.code}`)
      }
    }

    try {

      const sale = ['Residential', 'ResidentialSale', 'Commercial', 'CommercialSale'];
      const rental = ['ResidentialLease', 'CommercialLease'];
      var salesOrRental = 'S';
      const autosuggestionFullAddress = new Autosuggestion();

      if (rental.indexOf(propertyEntity.PropertyType) > -1) {
        salesOrRental = 'R'
      }

      autosuggestionFullAddress.name = propertyEntity.AddressWithUnit.toLowerCase();
      autosuggestionFullAddress.full_name = propertyEntity.AddressWithUnit;
      autosuggestionFullAddress.type = AutosuggestionType.FULL_ADDRESS;
      autosuggestionFullAddress.listing_key = propertyEntity.ListingKey;
      autosuggestionFullAddress.status = propertyEntity.StandardStatus;
      autosuggestionFullAddress.salesOrRental = salesOrRental;

      await autosuggestionFullAddress.save();
    } catch (e) {
      if (e.code !== '23505') {
        this.logger.log(`error in updateAutosuggestion with code ${e.code}`)
      }
      await this.autosuggestionRepository.update({ listing_key: propertyEntity.ListingKey }, { status: propertyEntity.StandardStatus, salesOrRental: salesOrRental })
    }

    try {
      if (propertyEntity.BuildingName) {
        const autosuggestionBuildingName = new Autosuggestion();
        autosuggestionBuildingName.name = propertyEntity.BuildingName.toLowerCase();
        autosuggestionBuildingName.full_name = propertyEntity.BuildingName;
        autosuggestionBuildingName.type = AutosuggestionType.BUILDING_NAME;
        autosuggestionBuildingName.building_key = propertyEntity.BuildingKey;
        await autosuggestionBuildingName.save();
      }
    } catch (e) {
      if (e.code !== '23505') {
        this.logger.log(`error in updateAutosuggestion with code ${e.code}`)
      }
    }
  }

  private parseAmenities(string: string | null | undefined, type?: string) {
    if (!string) return [];
    if (type === 'pets') {
      return string.split(',').map((amenity) => amenity.trim());
    }
    return string?.split(/(?=[A-Z])/).join(' ').split(',').map((amenity) => amenity.trim());
  }

  private parsePets(pets: string[]) {
    if (pets.indexOf('Yes') > -1 || pets.indexOf('Building Yes') > -1) {
      return ['Yes'];
    } else if (pets.indexOf('Building No') > -1 || pets.indexOf('No')) {
      return ['No'];
    }
    return pets;
  }

  public async updateCoordinatesFromDBByAddressAndZip(): Promise<any> {
    return 'everything is ok';
    this.logger.log('Started updating coordinates from DB by address and zip');
    let propertiesWithoutCoordinates: PropertyEntity[] = await this.propertiesRepository.query(`select 
      "ListingKey", 
      lower("UnparsedAddress") as "UnparsedAddress", 
      lower("StreetName") as "StreetName", 
      "StreetNumber", 
      "UnitNumber", 
      "PostalCode", 
      "SubdivisionName", 
      "CityRegion"
      from property_entity 
      where "Latitude" is null 
      and "Longitude" is null
      and "StandardStatus" = 'Active'`);

    let chunkArray = this.utilityService.chunkArray(propertiesWithoutCoordinates, 500);

    let total = 0;
    for (let j = 0; j < chunkArray.length; j++) {
      let withoutCoordinates = chunkArray[j];
      let queryUpdate = [];
      for (let i = 0; i < withoutCoordinates.length; i++) {
        let property = withoutCoordinates[i];

        let listingQuery = `select distinct on ("Longitude", "Latitude") "Longitude", "Latitude" from property_entity 
        where (lower("StreetName") like '%${property.StreetName}%' and "StreetNumber" like '%${property.StreetNumber}%' and "PostalCode" = '${property.PostalCode}') and "Latitude" is not null and "Longitude" is not null`;

        let addressesWithCoordinates = await this.propertiesRepository.query(listingQuery);

        if (addressesWithCoordinates.length) {
          queryUpdate.push(`update property_entity set "Latitude" = ${addressesWithCoordinates[0].Latitude}, "Longitude" = ${addressesWithCoordinates[0].Longitude} where "ListingKey" = '${property.ListingKey}';`)
        } else {
          listingQuery = `select distinct on (combined_latitude, combined_longitude) 1 as id, address, place_name, combined_latitude, combined_longitude from listing_entity 
          where (lower(address) like '%${property.StreetNumber}%${property.StreetName}%' and zip = '${property.PostalCode}')
          union select distinct on (combined_latitude, combined_longitude) 2 as id, address, address_with_unit, zip, place_name, combined_latitude, combined_longitude from listing_entity
          where (lower(address) like '%${property.StreetNumber.slice(0, -1)}%${property.StreetName}%' and zip = '${property.PostalCode}')`;

          addressesWithCoordinates = await this.listingRepository.query(listingQuery);

          if (addressesWithCoordinates.length) {
            let addressId = addressesWithCoordinates.find((address) => address.id === 1);
            let address = addressId ? addressId : addressesWithCoordinates[0];
            queryUpdate.push(`update property_entity set "Latitude" = ${address.combined_latitude}, "Longitude" = ${address.combined_longitude} where "ListingKey" = '${property.ListingKey}';`)
          }
        }
      }
      await this.propertiesRepository.query(queryUpdate.join(' '));
      total += queryUpdate.length;
      this.logger.log(`Updated ${queryUpdate.length} coordinates from DB by address and zip in chunk ${j + 1}, left ${chunkArray.length - j - 1}`);
    }

    this.logger.log(`Updated ${total} coordinates from DB by address and zip`);
    this.logger.log('Finished updating coordinates from DB by address and zip');
  }
}