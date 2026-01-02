import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
// import { format } from "date-fns";
// import { ListingEntity } from "../../modules/listings/entities/Listing.entity";
import { UserStorageService } from "../../modules/users/services/userStorage.service";
import { MailService } from "../../shared/mail/mail.service";
// import { PerchwellService } from "../perchwell/perchwell.service";
import { TrestleService } from "../tretsle/trestle.service";
import { PropertyEntity } from "../../modules/listings/entities/Property.entity";
import { AutosuggestionRepository } from "../../modules/listings/repositories/Autosuggestion.repository";
import { Autosuggestion, AutosuggestionType } from "../../modules/listings/entities/Autosuggestion.entity";
import { PropertyRepository } from "../../modules/listings/repositories/Properties.repository";
import { UtilityService } from "../../providers/utility.service";
// import { MapsLocationService } from "../maps-location/maps-location.service";
import { format } from "date-fns";
import { ListingsRepository } from "../../modules/listings/repositories/Listings.repository";
import { AppConfigService } from "../../config/app/config.service";

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    // private readonly perchwellService: PerchwellService,
    private readonly trestleService: TrestleService,
    private readonly autosuggestionRepository: AutosuggestionRepository,
    private readonly userStorageService: UserStorageService,
    private readonly mailService: MailService,
    private readonly propertiesRepository: PropertyRepository,
    private readonly utilityService: UtilityService,
    private readonly listingRepository: ListingsRepository,
    // private readonly mapsLocationService: MapsLocationService,
    private readonly appConfigService: AppConfigService,
  ) { }

  private formatDate = (date: Date) => `${format(date, 'yyyy-MM-dd')}T${format(date, 'HH:mm')}Z`

  @Cron(CronExpression.EVERY_DAY_AT_5PM)
  private async cronEmail() {
    if (this.appConfigService.cronJobsActive === '0') return;

    const userListings = await this.userStorageService.getSavingsForNotification();

    const groupedUserListings = userListings.reduce((acc, listing) => {
      if (!acc[listing.username]) {
        acc[listing.username] = {
          userInfo: {
            username: listing.username,
            email: listing.email
          },
          listings: []
        };
      }
      const img = !!listing.image_list_without_floorplans
        ? listing.image_list_without_floorplans[0]
        : (!!listing.image_list ? listing.image_list[0] : (!!listing.image_list_original ? listing.image_list_original[0] : ''));
      if (img.length > 0) {
        acc[listing.username].listings.push({ ...listing, img });
      }

      return acc;
    }, {});

    for (const user of Object.keys(groupedUserListings)) {
      const { userInfo, listings } = groupedUserListings[user]
      this.mailService.sendNotificationMail(userInfo, listings);
      await this.userStorageService.updateForNotification(listings, userInfo, false);
    }
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  private async filterByModificationTimestamp(req?: any) {
    if (this.appConfigService.cronJobsActive === '0') return;

    this.logger.log('Started filtering by modification timestamp');
    let data: any;
    let date = new Date();
    if (!req) {
      data = await this.trestleService.fetchListingMedia({ endpoint: this.trestleService.endpoints.filterByModificationTimestamp(date) });
    } else {
      const { url, token } = req;
      data = await this.trestleService.fetchListingMedia({ url, token });
    }
    this.logger.log(`Fetched ${data.value.length} records.`);
    await this.saveData(data, date);

    if (data['@odata.nextLink']) {
      await this.filterByModificationTimestamp({ url: data['@odata.nextLink'], token: data.token });
    } else {
      await this.updateCoordinatesFromDBByAddressAndZip();
    }
  }

  // @Cron(CronExpression.EVERY_DAY_AT_5AM)
  // public async updateCoordinatesFromGeocodeMaps(): Promise<void> {
  //   this.logger.log('Started updating coordinates with Geocode Maps');
  //   const propertiesQuery = this.propertiesRepository.createQueryBuilder('pr')
  //     .select([`pr."UnparsedAddress" as address`, `pr."PostalCode" as postalCode`, `pr."CityRegion" as region`])
  //     .where(`pr."Latitude" is null and pr."Longitude" is null`)
  //     .andWhere(`pr."StandardStatus" = 'Active'`)
  //     .distinctOn(['pr."UnparsedAddress"'])
  //   const coordinates = await propertiesQuery.getRawMany();
  //   this.logger.log(`Found ${coordinates.length} coordinates to update with Geocode Maps`);
  //   let count = 0;
  //   for (let i = 0; i < coordinates.length; i++) {
  //     await this.utilityService.sleep(1000);
  //     const coordinatesData = (await this.mapsLocationService.geocodeMapsFetchCoordinates(coordinates[i].address, coordinates[i].postalcode, coordinates[i].region)) as any;
  //     if (!coordinatesData) continue;

  //     const query = `
  //     update property_entity set "Latitude" = '${coordinatesData.latitude}', 
  //     "Longitude" = '${coordinatesData.longitude}' where 
  //     lower("UnparsedAddress") = '${coordinates[i].address.toLowerCase()}'`
  //     count++;
  //     await this.propertiesRepository.query(query);
  //     this.logger.log(`Updated ${coordinates[i].address} coordinates with Geocode Maps`);
  //   }
  //   this.logger.log(`Updated ${count} coordinates with Geocode Maps`);
  // }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  public async updateDeletedListings(): Promise<void> {
    if (this.appConfigService.cronJobsActive === '0') return;

    this.logger.log('Started updating deleted listings');
    try {
      const propertyListingKeys = (await this.propertiesRepository.query(`select "ListingKey" from property_entity`)).map((property) => property.ListingKey);

      const trestleListingKeys = await this.trestleService.fetchReconciliationData();
      const trestleSet = new Set(trestleListingKeys);
      const deletedListings = propertyListingKeys.filter((listingKey) => !trestleSet.has(listingKey));

      await this.propertiesRepository.query(`update property_entity set "StandardStatus" = 'Delete' where "ListingKey" in (${deletedListings.map((listingKey) => `'${listingKey}'`).join(',')})`);
      this.logger.log(`Updated ${deletedListings.length} deleted listings`);
    } catch (e) {
      this.logger.error(e);
    }

    this.logger.log('Finished updating deleted listings');
  }

  public async updateCoordinatesFromDB(): Promise<void> {
    this.logger.log('Started updating coordinates from DB');

    let addressesWithCoordinates = await this.propertiesRepository.query(`select distinct(address) address, combined_latitude as latitude, combined_longitude as longitude from listing_entity 
    where lower(address) in (
    select lower("UnparsedAddress") as UnparsedAddress from property_entity where "Latitude" is null and "Longitude" is null and "StandardStatus" = 'Active' group by UnparsedAddress 
    ) and combined_latitude is not null and combined_longitude is not null`);

    let count = 0;
    for (let i = 0; i < addressesWithCoordinates.length; i++) {
      if (!addressesWithCoordinates[i].longitude && !addressesWithCoordinates[i].latitude) continue;

      const query = `
      update property_entity set "Latitude" = '${addressesWithCoordinates[i].latitude}', 
      "Longitude" = '${addressesWithCoordinates[i].longitude}' where 
      lower("UnparsedAddress") = '${addressesWithCoordinates[i].address.toLowerCase()}'`
      count++;
      await this.propertiesRepository.query(query)
    }
    this.logger.log(`Updated ${count} coordinates from listing_entity to property_entity`);

    count = 0;
    addressesWithCoordinates = await this.propertiesRepository.query(`select distinct("UnparsedAddress"), "UnparsedAddress" as address, "Latitude" as latitude, "Longitude" as longitude from "property_entity" 
    where lower("UnparsedAddress") in (
    select lower("UnparsedAddress") from "property_entity" where "Latitude" is null and "Longitude" is null and "StandardStatus" = 'Active' group by "UnparsedAddress"
    ) and "Latitude" is not null and "Longitude" is not null`);

    for (let i = 0; i < addressesWithCoordinates.length; i++) {
      if (!addressesWithCoordinates[i].longitude && !addressesWithCoordinates[i].latitude) continue;

      const query = `
      update property_entity set "Latitude" = '${addressesWithCoordinates[i].latitude}', 
      "Longitude" = '${addressesWithCoordinates[i].longitude}' where 
      lower("UnparsedAddress") = '${addressesWithCoordinates[i].address.toLowerCase()}'`
      count++;
      await this.propertiesRepository.query(query)
    }
    this.logger.log(`Updated ${count} coordinates from property_entity to property_entity`);
  }

  public async updateCoordinatesFromDBByAddressAndZip(): Promise<void> {
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
  }

  private async saveData(data: any, date: Date) {
    this.logger.log(`Started saving data at ${this.formatDate(date)}`);
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
          overwrite: this.utilityService.getPopulatedColumns(),
          conflict_target: ["ListingKey", "ListingId"]
        })
        .execute();

      await this.createUpdateAutosuggestions(properties);
    } catch (e) {
      this.logger.error(e);
    }
  }

  private async createUpdateAutosuggestions(propertyEntities?: PropertyEntity[]) {

    if (propertyEntities) {
      for (let i = 0; i < propertyEntities.length; i++) {
        await this.updateAutosuggestion(propertyEntities[i]);
      }
    }
  }

  private async updateAutosuggestion(propertyEntity: PropertyEntity) {
    // Insert City
    await this.autosuggestionRepository.query(`
      INSERT INTO autosuggestion (name, full_name, type)
      values ('${propertyEntity.City.toLowerCase()}', '${propertyEntity.City}','6'::autosuggestion_type_enum)
        on conflict (name, type)
        do nothing;	`);

    // Insert Places
    await this.autosuggestionRepository.query(`
      INSERT INTO autosuggestion (name, full_name, type)
      values ('${propertyEntity.SubdivisionName.toLowerCase()}', '${propertyEntity.SubdivisionName}', '1'::autosuggestion_type_enum)
        on conflict (name, type)
        do nothing;
      `)

      // Insert Zip
      await this.autosuggestionRepository.query(`
        INSERT INTO autosuggestion (name, full_name, type)
        values ('${propertyEntity.PostalCode.toLowerCase()}', '${propertyEntity.PostalCode}', '5'::autosuggestion_type_enum)
          on conflict (name, type)
          do nothing;
        `)

      // Insert Region
      await this.autosuggestionRepository.query(`
        INSERT INTO autosuggestion (name, full_name, type)
         values ('${propertyEntity.CityRegion.toLowerCase()}', '${propertyEntity.CityRegion}', '7'::autosuggestion_type_enum)
          on conflict (name, type)
          do nothing;
        `)

    try {
      const autosuggestionAddress = new Autosuggestion();
      autosuggestionAddress.name = `${propertyEntity.StreetNumber.toLowerCase()} ${propertyEntity.StreetName.toLowerCase()}`;
      autosuggestionAddress.type = AutosuggestionType.ADDRESS;
      autosuggestionAddress.full_name = `${propertyEntity.StreetNumber} ${propertyEntity.StreetName}`;
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
      autosuggestionFullAddress.type = AutosuggestionType.FULL_ADDRESS;
      autosuggestionFullAddress.listing_key = propertyEntity.ListingKey;
      autosuggestionFullAddress.full_name = propertyEntity.AddressWithUnit;
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

  // @Cron(CronExpression.EVERY_4_HOURS)
  // private async cronUpdateListings() {
  //     const query = `(UpdatedAt=${format(new Date(), 'yyyy-MM-dd')})`;
  //     let arr = [1];

  //     let resultLength: number = 0;
  //     for await (let el of arr) {
  //         const data = await this.perchwellService.fetchDataFromPerchwell(
  //             query,
  //             resultLength
  //         ) as ListingEntity[];

  //         data.forEach((el) => {
  //             let listingEntity = new ListingEntity();
  //             listingEntity = plainToClass(ListingEntity, el);
  //             try {
  //                 listingEntity.save();
  //             } catch (e) {
  //                 this.logger.log(el);
  //                 this.logger.log(ERRORS_CONSTANTS.DB[e.code]('ListingEntity'));
  //             } finally {
  //             }
  //         });

  //         resultLength += data.length;
  //         if (data.length) {
  //             await this.userStorageService.updateForNotification(data, undefined, true);
  //             arr.push(el + 1);
  //         }
  //     }
  //     this.logger.debug(`Updated ${resultLength} records.`);
  // }
}