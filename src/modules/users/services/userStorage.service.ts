import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { UserStorageRepository } from '../repositories/userStorage.repository';
import { UserStorage } from '../entities/UserStorage.entity';
import { Users } from '../entities/Users.entity';
import { UserStorageDto } from '../dto/UserStorage.dto';
import { ERRORS_CONSTANTS } from '../../../shared/constants/errors.constants';
import { UserDto } from '../dto/User.dto';
import { PropertyRepository } from '../../listings/repositories/Properties.repository';
import { PropertyEntity } from '../../listings/entities/Property.entity';


@Injectable()
export class UserStorageService {
  constructor(
    private readonly userStorageRepository: UserStorageRepository,
    private readonly propertyRepository: PropertyRepository,
  ) { }

  public async addApartmentInStorage(
    property: PropertyEntity,
    user: Users
  ): Promise<object> {
    let userStorage: UserStorage = new UserStorage();
    userStorage.listing_key = property.ListingKey;
    userStorage.user = user;
    await this.userStorageRepository.addInStorage(userStorage);
    return { data: { added: true } };
  }

  public async addRemoveApartmentFromStorage(
    storage: UserStorageDto,
    user: Users
  ): Promise<object> {
    // const apartament = await this.listingsRepository.findOne({
    //   id: storage.apartamentId,
    // });

    const property = await this.propertyRepository.findOne({
      where: {
        ListingKey: storage.listing_key
      }      
    })


    if (!property) {
      throw new BadRequestException(
        [ERRORS_CONSTANTS.SAVED_LISTINGS.LISTING_NOT_SAVED,
        ERRORS_CONSTANTS.SAVED_LISTINGS.LISTING_NOT_FOUND]
      );
    }

    let userApartament = await this.userStorageRepository.findOne({
      where: { listing_key: property.ListingKey },
    });

    if (userApartament) {
      return await this.deleteOne(userApartament);
    } else {
      return await this.addApartmentInStorage(property, user);
    }
  }

  public async addBuildingInStorage(
    building: PropertyEntity,
    user: Users
  ): Promise<object> {
    let userStorage: UserStorage = new UserStorage();
    userStorage.building_key = building.BuildingKey;
    userStorage.user = user;
    try {
      await this.userStorageRepository.addInStorage(userStorage);
    } catch (e) {
      throw new BadRequestException([ERRORS_CONSTANTS.DB[e.message]()]);
    }

    return { data: { added: true } };
  }

  public async addRemoveBuildingFromStorage(
    storage: UserStorageDto,
    user: Users
  ): Promise<object> {
    const building = await this.propertyRepository.findOne({ where: { BuildingKey: storage.building_key } });

    if (!building) {
      throw new BadRequestException(
        [ERRORS_CONSTANTS.SAVED_LISTINGS.LISTING_NOT_SAVED,
        ERRORS_CONSTANTS.SAVED_LISTINGS.LISTING_NOT_FOUND]
      );
    }

    let userBuilding = await this.userStorageRepository.findOne({
      where: { building_key: building.BuildingKey },
    });

    if (userBuilding) {
      return await this.deleteOne(userBuilding);
    } else {
      return await this.addBuildingInStorage(building, user);
    }
  }

  public async getAllByUser(user: Users) {
    const dataApartment = await this.userStorageRepository.createQueryBuilder('us')
      .select([`pe."ListingKey" as id`, `pe."MediaURL" as image_list`,
        `to_char((pe."ListPrice")::bigint, 'FM9,999,999,999') as listing_price_formatted`,
        `pe."ListPrice" as listing_price`, `pe."UnparsedAddress" as address`,
        `pe."AddressWithUnit" as address_with_unit`, `pe."BedroomsTotal" as num_bedrooms`, `pe."BathroomsTotalInteger"`,
        `to_char((pe."LotSizeArea")::bigint, 'FM9,999,999,999') as sqft_formatted`,
        `pe."LotSizeArea" as sqft`, `pe."SubdivisionName" as place_name`,
        `true as saved_data`,
        `us.date_created as date_created`, `true as apartment`])
      .addSelect([`case 
      when pe."BuildingName" = '0' then ''
      else pe."BuildingName"
      end as building_name`])
      .innerJoin(PropertyEntity, 'pe', `pe."ListingKey" = us."listing_key"`)
      .where(`us."userId" = :id`, { id: user.id })
      .andWhere(`"StandardStatus" = 'Active'`)
      // .orderBy('us.date_created', 'ASC')
      // .addOrderBy('pe."SubdivisionName"', 'ASC')
      .distinctOn(['pe."ListingKey"'])
      .execute();

    const dataBuilding = await this.userStorageRepository.createQueryBuilder('us')
      .select([`pe."UnparsedAddress" as address`, `pe."BuildingKey" as building_key`,
        `pe."SubdivisionName" as place_name`, `pe."MediaURL" as image_list`,
        `true as saved_data`, `pe."BuildingKey" as building_id`,
        `us.date_created as date_created`, `true as building`])
      .addSelect([`case 
      when pe."BuildingName" = '0' then ''
      else pe."BuildingName"
      end as building_name`])
      .innerJoin(PropertyEntity, 'pe', `pe."BuildingKey" = us.building_key`)
      .distinctOn(['pe."BuildingKey"'])
      .where(`us."userId" = :id`, { id: user.id })
      .execute();

    return [...dataApartment, ...dataBuilding];
  }

  public async deleteOne(listing: UserStorage): Promise<object> {
    await this.userStorageRepository.deleteStorage(listing);

    return { data: { delete: true } };
  }

  public async updateForNotification(listings: Array<PropertyEntity>, user: UserDto, sendNotification: boolean) {
    const apartmentsIds = listings.map((listing) => listing.ListingKey);
    const buildingsIds = listings.map((building) => building.BuildingKey);

    const apartmentsForUpdateQuery = this.userStorageRepository.createQueryBuilder('us')
      .select(['us.*'])
      .innerJoin(Users, 'u', 'u.id = us."userId"')
      .where('u.receiveNotification = true')
      .andWhere('us."apartamentId" IN (:...apartmentsIds)', { apartmentsIds })

    if (user) {
      apartmentsForUpdateQuery.andWhere('u.email = :email', { email: user.email });
    }

    const apartmentsForUpdate = await apartmentsForUpdateQuery.execute()

    const buildingsForUpdateQuery = this.userStorageRepository.createQueryBuilder('us')
      .select(['us.*'])
      .innerJoin(Users, 'u', 'u.id = us."userId"')
      .where('u.receiveNotification = true')
      .andWhere('us.building_index IN (:...buildingsIds)', { buildingsIds })

    if (user) {
      buildingsForUpdateQuery.andWhere('u.email = :email', { email: user.email });
    }

    const buildingsForUpdate = await buildingsForUpdateQuery.execute();

    if (apartmentsForUpdate.length > 0) {
      await this.userStorageRepository.bulkUpdateSendNotification(apartmentsForUpdate.map(({ id }) => id), sendNotification);
    }
    if (buildingsForUpdate.length > 0) {
      await this.userStorageRepository.bulkUpdateSendNotification(buildingsForUpdate.map(({ id }) => id), sendNotification);
    }
  }

  public async getSavingsForNotification() {
    const savings = await this.userStorageRepository.createQueryBuilder('us')
      .select(['pe.*', 'u.name as username', 'u.email as email', 'us.building_key as buildingIndex', 'us."listing_key" as apartmentIndex'])
      .innerJoin(Users, 'u', 'u.id = us."userId"')
      .innerJoin(PropertyEntity, 'pe', `pe."ListingKey" = us."listing_key"`)
      .where('u.receiveNotification = true')
      .andWhere('us.sendNotification = true')
      .execute();

    return savings;
  }
}
