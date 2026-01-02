import { Injectable } from '@nestjs/common';
import { getConnection } from 'typeorm';
import { ListingEntity } from '../modules/listings/entities/Listing.entity';
import { ILocation } from '../shared/interfaces/location.interface';

@Injectable()
export class UtilityService {

  public calculateDistance(pointOne: ILocation, pointTwo: ILocation) {
    var R = 6371; // km
    const dLat = this.toRad(pointTwo.latitude - pointOne.latitude);
    const dLon = this.toRad(pointTwo.longitude - pointOne.longitude);
    const lat1 = this.toRad(pointOne.latitude);
    const lat2 = this.toRad(pointOne.latitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    var d = R * c;
    return this.convertKilometerToMiles(d);
  }

  public convertKilometerToMiles(value: number) {
    return Math.round((value * 0.621371192 + Number.EPSILON) * 100) / 100;
  }

  public async getColumnsNames() {
    const connection = getConnection();
    return await connection.getMetadata('ListingEntity').columns.map(value => value.databaseName);
  }

  public mapXMLtoJSON(columnNames, apartment) {
    let listing = new ListingEntity();
    const snakeCaseToCamelcase = columnNames.reduce((acc, current) => {
      acc[current.replace(/_/g, '')] = current;
      return acc;
    }, []);
    Object.keys(apartment).forEach(key => {
      switch (key) {
        case 'ImageList':
        case 'ImageListLarge':
        case 'ImageListOriginal':
        case 'ImageListWithoutFloorplans':
        case 'FloorPlanList':
          listing[snakeCaseToCamelcase[key.toLowerCase()]] = apartment[key];
          break;
        case 'IDXDisplay':
          listing.rls_idx_display = this.parseNullBooleanNumber(apartment[key][0]);
          break;
        case 'NumBuildingUnits':
          listing.num_units = this.parseNullBooleanNumber(apartment[key][0]);
          break;
        case 'NumBuildingStories':
          listing.num_stories = this.parseNullBooleanNumber(apartment[key][0]);
          break;
        case 'Longitude':
          listing.combined_longitude = this.parseNullBooleanNumber(apartment[key][0])
          break;
        case 'Latitude':
          listing.combined_latitude = this.parseNullBooleanNumber(apartment[key][0])
          break;
        default:
          listing[snakeCaseToCamelcase[key.toLowerCase()]] = this.parseNullBooleanNumber(apartment[key][0]);
          break;
      }
    })
    return listing;
  }

  private parseNullBooleanNumber(value: any) {
    if (value === 'null') {
      return null;
    } else if (value === 'true') {
      return true;
    } else if (value === 'false') {
      return false;
    } else if (!isNaN(+value)) {
      return +value;
    }
    return value;
  }

  chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      result.push(array.slice(i, i + chunkSize));
    }
    return result;
  }

  // Converts numeric degrees to radians
  private toRad(Value: number) {
    return (Value * Math.PI) / 180;
  }

  public sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public getPopulatedColumns() {
    return ["ListingKey",
      "AssociationFeeIncludes",
      "AvailabilityDate",
      "BuildingFeatures",
      "City",
      "CityRegion",
      "CommonInterest",
      "CountyOrParish",
      "CrossStreet",
      "Flooring",
      "Furnished",
      "GarageYN",
      "Heating",
      "InteriorFeatures",
      "InternetAutomatedValuationDisplayYN",
      "InternetConsumerCommentYN",
      "LaundryFeatures",
      "ListOfficeName",
      "ListPrice",
      "ListingAgreement",
      "ListingContractDate",
      "ListingId",
      "ListingURL",
      "LivingAreaUnits",
      "MajorChangeTimestamp",
      "MajorChangeType",
      "ModificationTimestamp",
      "OnMarketDate",
      "OnMarketTimestamp",
      "OriginalEntryTimestamp",
      "OriginalListPrice",
      "OriginatingSystemID",
      "OriginatingSystemKey",
      "OriginatingSystemName",
      "PetsAllowed",
      "PhotosChangeTimestamp",
      "PostalCity",
      "PostalCode",
      "PreviousListPrice",
      "PriceChangeTimestamp",
      "PropertySubType",
      "PropertyType",
      "PublicRemarks",
      "SourceSystemID",
      "SourceSystemKey",
      "StandardStatus",
      "StateOrProvince",
      "StreetName",
      "StreetNumber",
      "StreetSuffix",
      "StructureType",
      "SubdivisionName",
      "TaxBlock",
      "TaxLot",
      "UnitNumber",
      "UnparsedAddress",
      "VirtualTourURLUnbranded",
      "DaysOnMarketReplicationDate",
      "PropertySubTypeAdditional",
      "Permission",
      "OriginatingSystemSubName",
      "DaysOnMarketReplicationIncreasingYN",
      "AssociationFeeFrequency",
      "Basement",
      "BuildingName",
      "PatioAndPorchFeatures",
      "SpecialListingConditions",
      "Zoning",
      "Appliances",
      "ArchitecturalStyle",
      "CoListOfficeName",
      "AssociationFee",
      "Cooling",
      "ExteriorFeatures",
      "StatusChangeTimestamp",
      "View",
      "ViewYN",
      "LivingArea",
      "CoolingYN",
      "StreetDirPrefix",
      "BasementYN",
      "CurrentUse",
      "DevelopmentStatus",
      "HeatingYN",
      "LotFeatures",
      "LotSizeDimensions",
      "LotSizeUnits",
      "WindowFeatures",
      "SecurityDeposit",
      "PurchaseContractDate",
      "ParkingFeatures",
      "TaxAnnualAmount",
      "Levels",
      "BuildingAreaUnits",
      "NewConstructionYN",
      "CommunityFeatures",
      "SpaFeatures",
      "FireplaceFeatures",
      "FireplaceYN",
      "LandLeaseExpirationDate",
      "LandLeaseYN",
      "LeaseTerm",
      "AssociationFee2",
      "AssociationFee2Frequency",
      "OtherEquipment",
      "PendingTimestamp",
      "DirectionFaces",
      "OwnerPays",
      "StreetDirSuffix",
      "RoomType",
      "OtherStructures",
      "ShowingContactName",
      "ShowingContactPhone",
      "AssociationName",
      "ConstructionMaterials",
      "Exclusions",
      "Inclusions",
      "SecurityFeatures",
      "PoolFeatures",
      "SpaYN",
      "LotDimensionsSource",
      "LotSizeSource",
      "AttachedGarageYN",
      "CarportYN",
      "LeaseRenewalCompensation",
      "AccessibilityFeatures",
      "VirtualTourURLBranded",
      "GreenEnergyEfficient",
      "CloseDate",
      "ClosePrice",
      "OffMarketDate",
      "OffMarketTimestamp",
      "LaborInformation",
      "Fencing",
      "UnitTypeType",
      "ShowingContactType",
      "BuilderName",
      "ElectricOnPropertyYN",
      "WaterfrontFeatures",
      "WaterfrontYN",
      "HomeWarrantyYN",
      "FoundationDetails",
      "OpenParkingYN",
      "Electric",
      "GreenIndoorAirQuality",
      "DoorFeatures",
      "GreenBuildingVerificationType",
      "ShowingContactPhoneExt",
      "ZoningDescription",
      "BathroomsFull",
      "BathroomsTotalInteger",
      "BedroomsTotal",
      "BuildingAreaTotal",
      "LotSizeArea",
      "PhotosCount",
      "RoomsTotal",
      "StoriesTotal",
      "YearBuilt"]
  }
}
