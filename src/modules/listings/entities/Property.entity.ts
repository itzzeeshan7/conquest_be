/* eslint-disable prettier/prettier */
import { Column, Entity, Unique, Index, PrimaryGeneratedColumn } from 'typeorm';
import { MainEntity } from '../../../shared/database/Base.entity';
import * as crypto from "crypto";

@Entity()
@Unique('listing', ['ListingKey', 'ListingId'])
export class PropertyEntity extends MainEntity {

    @PrimaryGeneratedColumn()
    Id: number;

    @Column({ nullable: false })
    @Index('LISTING_KEY_INDEX')
    ListingKey: string;

    @Column({ nullable: true })
    @Index('BUILDING_KEY_INDEX')
    BuildingKey: string;

    // @Column({ nullable: false })
    // ListingKeyNumeric: number;

    // @Column({ nullable: true })
    // AboveGradeFinishedArea: number;

    // @Column({ nullable: true })
    // AboveGradeFinishedAreaSource: string;

    // @Column({ nullable: true })
    // AboveGradeFinishedAreaUnits: string;

    // @Column({ nullable: true })
    // AccessCode: string;

    @Column({ nullable: true })
    AccessibilityFeatures: string;

    // @Column({ nullable: true })
    // AdditionalParcelsDescription: string;

    // @Column({ nullable: true })
    // AdditionalParcelsYN: boolean;

    // @Column({ nullable: true })
    // AlternateStreetDirPrefix: string;

    // @Column({ nullable: true })
    // AlternateStreetDirSuffix: string;

    // @Column({ nullable: true })
    // AlternateStreetName: string;

    // @Column({ nullable: true })
    // AlternateStreetNumber: string;

    // @Column({ nullable: true })
    // AlternateStreetSuffix: string;

    // @Column({ nullable: true })
    // AnchorsCoTenants: string;

    @Column({ nullable: true })
    Appliances: string;

    @Column({ nullable: true })
    ArchitectName: string;

    @Column({ nullable: true })
    ArchitecturalStyle: string;

    // @Column({ nullable: true })
    // AreaOverFAR: number;

    // @Column({ nullable: true })
    // AreaUnderFAR: number;

    @Column({ nullable: true })
    AssociationAmenities: string;

    @Column({ nullable: true, type: 'float4' })
    AssociationFee: number;

    @Column({ nullable: true, type: 'float4' })
    AssociationFee2: number;

    @Column({ nullable: true })
    AssociationFee2Frequency: string;

    @Column({ nullable: true })
    AssociationFeeFrequency: string;

    @Column({ nullable: true })
    AssociationFeeIncludes: string;

    @Column({ nullable: true })
    AssociationName: string;

    @Column({ nullable: true })
    AssociationName2: string;

    @Column({ nullable: true })
    AssociationPhone: string;

    @Column({ nullable: true })
    AssociationPhone2: string;

    @Column({ nullable: true })
    AssociationYN: boolean;

    @Column({ nullable: true })
    AttachedGarageYN: boolean;

    @Column({ nullable: true })
    AttendanceType: string;

    @Column({ nullable: true, type: 'date' })
    AvailabilityDate: Date;

    @Column({ nullable: true })
    Basement: string;

    @Column({ nullable: true })
    BasementYN: boolean;

    @Column({ nullable: true })
    BathroomCondition: string;

    @Column({ nullable: true, type: 'float4' })
    BathroomsFull: number;

    @Column({ nullable: true, type: 'float4' })
    BathroomsHalf: number;

    @Column({ nullable: true, type: 'float4' })
    BathroomsOneQuarter: number;

    @Column({ nullable: true, type: 'float4' })
    BathroomsPartial: number;

    @Column({ nullable: true, type: 'float4' })
    BathroomsThreeQuarter: number;

    @Column({ nullable: true, type: 'float4' })
    BathroomsTotal: number;

    @Column({ nullable: true, type: 'float4' })
    BathroomsTotalInteger: number;

    @Column({ nullable: true, type: 'float4' })
    BedroomsPossible: number;

    @Column({ nullable: true, type: 'float4' })
    BedroomsTotal: number;

    // @Column({ nullable: true })
    // BelowGradeFinishedArea: number;

    // @Column({ nullable: true })
    // BelowGradeFinishedAreaSource: string;

    // @Column({ nullable: true })
    // BelowGradeFinishedAreaUnits: string;

    @Column({ nullable: true })
    BoardApprovalRequiredYN: boolean;

    @Column({ nullable: true })
    BodyType: string;

    @Column({ nullable: true })
    BonusRemarks: string;

    @Column({ nullable: true })
    BonusYN: boolean;

    @Column({ nullable: true })
    BuilderModel: string;

    @Column({ nullable: true })
    BuilderName: string;

    @Column({ nullable: true })
    BuildingAreaSource: string;

    @Column({ nullable: true, type: 'float4' })
    BuildingAreaTotal: number;

    @Column({ nullable: true })
    BuildingAreaUnits: string;

    @Column({ nullable: true })
    BuildingFeatures: string;

    @Index('PROPERTY_ENTITY_BUILDING_NAME_INDEX')
    @Column({ nullable: true })
    BuildingName: string;

    @Column({ nullable: true })
    BuildingOfficeAssociationComments: string;

    @Column({ nullable: true })
    BuildingParkingFeatures: string;

    @Column({ nullable: true, type: 'float4' })
    BuildingParkingTotal: number;

    @Column({ nullable: true })
    BuildingRules: string;

    @Column({ nullable: true, type: 'float' })
    BuildingSizeDimensions: number;

    @Column({ nullable: true })
    BuildingSmokeFree: boolean;

    @Column({ nullable: true })
    BuildingSocialMedia: string;

    @Column({ nullable: true })
    BuildingStaff: string;

    @Column({ nullable: true, type: 'float' })
    BuildingTaxAnnualAmount: number;

    @Column({ nullable: true })
    BuildingTaxLot: string;

    @Column({ nullable: true, type: 'float' })
    BuildingTotalGrossFootage: number;

    @Column({ nullable: true, type: 'float' })
    BuildingTotalNetSquareFootage: number;

    @Column({ nullable: true })
    BusinessName: string;

    @Column({ nullable: true })
    BusinessType: string;

    @Column({ nullable: true })
    BuyerAgencyCompensation: string;

    @Column({ nullable: true })
    BuyerAgencyCompensationType: string;

    @Column({ nullable: true })
    BuyerAgentAOR: string;

    // @Column({ nullable: true })
    // BuyerAgentDesignation: string;

    // @Column({ nullable: true })
    // BuyerAgentDirectPhone: string;

    // @Column({ nullable: true })
    // BuyerAgentEmail: string;

    // @Column({ nullable: true })
    // BuyerAgentFax: string;

    // @Column({ nullable: true })
    // BuyerAgentFirstName: string;

    // @Column({ nullable: true })
    // BuyerAgentFullName: string;

    // @Column({ nullable: true })
    // BuyerAgentHomePhone: string;

    // @Column({ nullable: true })
    // BuyerAgentKey: string;

    // @Column({ nullable: true })
    // BuyerAgentKeyNumeric: number;

    // @Column({ nullable: true })
    // BuyerAgentLastName: string;

    // @Column({ nullable: true })
    // BuyerAgentMiddleName: string;

    @Column({ nullable: true })
    BuyerAgentMlsId: string;

    // @Column({ nullable: true })
    // BuyerAgentMobilePhone: string;

    // @Column({ nullable: true })
    // BuyerAgentNamePrefix: string;

    // @Column({ nullable: true })
    // BuyerAgentNameSuffix: string;

    // @Column({ nullable: true })
    // BuyerAgentOfficePhone: string;

    // @Column({ nullable: true })
    // BuyerAgentOfficePhoneExt: string;

    // @Column({ nullable: true })
    // BuyerAgentPager: string;

    // @Column({ nullable: true })
    // BuyerAgentPreferredPhone: string;

    // @Column({ nullable: true })
    // BuyerAgentPreferredPhoneExt: string;

    // @Column({ nullable: true })
    // BuyerAgentStateLicense: string;

    // @Column({ nullable: true })
    // BuyerAgentTollFreePhone: string;

    // @Column({ nullable: true })
    // BuyerAgentURL: string;

    // @Column({ nullable: true })
    // BuyerAgentVoiceMail: string;

    // @Column({ nullable: true })
    // BuyerAgentVoiceMailExt: string;

    @Column({ nullable: true })
    BuyerFinancing: string;

    // @Column({ nullable: true })
    // BuyerOfficeAOR: string;

    // @Column({ nullable: true })
    // BuyerOfficeEmail: string;

    // @Column({ nullable: true })
    // BuyerOfficeFax: string;

    // @Column({ nullable: true })
    // BuyerOfficeKey: string;

    // @Column({ nullable: true })
    // BuyerOfficeKeyNumeric: number;

    // @Column({ nullable: true })
    // BuyerOfficeMlsId: string;

    // @Column({ nullable: true })
    // BuyerOfficeName: string;

    // @Column({ nullable: true })
    // BuyerOfficePhone: string;

    // @Column({ nullable: true })
    // BuyerOfficePhoneExt: string;

    // @Column({ nullable: true })
    // BuyerOfficeURL: string;

    @Column({ nullable: true })
    BuyerTeamKey: string;

    // @Column({ nullable: true })
    // BuyerTeamKeyNumeric: number;

    @Column({ nullable: true })
    BuyerTeamName: string;

    @Column({ nullable: true, type: 'float4' })
    CableTvExpense: number;

    @Column({ nullable: true, type: 'date' })
    CancellationDate: Date;

    @Column({ nullable: true, type: 'float4' })
    CapRate: number;

    @Column({ nullable: true, type: 'float4' })
    CarportSpaces: number;

    @Column({ nullable: true })
    CarportYN: boolean;

    @Column({ nullable: true })
    CarrierRoute: string;

    @Column({ nullable: true, type: 'float4' })
    CeilingHeight: number;

    @Column({ nullable: true })
    CeilingHeightUnits: string;

    @Column({ nullable: true })
    CertificateOfOccupancyYN: boolean;

    @Index('PROPERTY_ENTITY_CITY_INDEX')
    @Column({ nullable: true })
    City: string;

    @Index('PROPERTY_ENTITY_CITY_REGION_INDEX')
    @Column({ nullable: true })
    CityRegion: string;

    @Column({ nullable: true, type: 'date' })
    CloseDate: Date;

    @Column({ nullable: true, type: 'float4' })
    ClosePrice: number;

    @Column({ nullable: true, type: 'float4' })
    ClosetsTotal: number;

    @Column({ nullable: true })
    CoBrokeAgreement: string;

    @Column({ nullable: true })
    CoBuyerAgentAOR: string;

    // @Column({ nullable: true })
    // CoBuyerAgentDesignation: string;

    // @Column({ nullable: true })
    // CoBuyerAgentDirectPhone: string;

    // @Column({ nullable: true })
    // CoBuyerAgentEmail: string;

    // @Column({ nullable: true })
    // CoBuyerAgentFax: string;

    // @Column({ nullable: true })
    // CoBuyerAgentFirstName: string;

    // @Column({ nullable: true })
    // CoBuyerAgentFullName: string;

    // @Column({ nullable: true })
    // CoBuyerAgentHomePhone: string;

    // @Column({ nullable: true })
    // CoBuyerAgentKey: string;

    // @Column({ nullable: true })
    // CoBuyerAgentKeyNumeric: number;

    // @Column({ nullable: true })
    // CoBuyerAgentLastName: string;

    // @Column({ nullable: true })
    // CoBuyerAgentMiddleName: string;

    // @Column({ nullable: true })
    // CoBuyerAgentMlsId: string;

    // @Column({ nullable: true })
    // CoBuyerAgentMobilePhone: string;

    // @Column({ nullable: true })
    // CoBuyerAgentNamePrefix: string;

    // @Column({ nullable: true })
    // CoBuyerAgentNameSuffix: string;

    // @Column({ nullable: true })
    // CoBuyerAgentOfficePhone: string;

    // @Column({ nullable: true })
    // CoBuyerAgentOfficePhoneExt: string;

    // @Column({ nullable: true })
    // CoBuyerAgentPager: string;

    // @Column({ nullable: true })
    // CoBuyerAgentPreferredPhone: string;

    // @Column({ nullable: true })
    // CoBuyerAgentPreferredPhoneExt: string;

    // @Column({ nullable: true })
    // CoBuyerAgentStateLicense: string;

    // @Column({ nullable: true })
    // CoBuyerAgentTollFreePhone: string;

    // @Column({ nullable: true })
    // CoBuyerAgentURL: string;

    // @Column({ nullable: true })
    // CoBuyerAgentVoiceMail: string;

    // @Column({ nullable: true })
    // CoBuyerAgentVoiceMailExt: string;

    // @Column({ nullable: true })
    // CoBuyerOfficeAOR: string;

    // @Column({ nullable: true })
    // CoBuyerOfficeEmail: string;

    // @Column({ nullable: true })
    // CoBuyerOfficeFax: string;

    // @Column({ nullable: true })
    // CoBuyerOfficeKey: string;

    // @Column({ nullable: true })
    // CoBuyerOfficeKeyNumeric: number;

    // @Column({ nullable: true })
    // CoBuyerOfficeMlsId: string;

    // @Column({ nullable: true })
    // CoBuyerOfficeName: string;

    // @Column({ nullable: true })
    // CoBuyerOfficePhone: string;

    // @Column({ nullable: true })
    // CoBuyerOfficePhoneExt: string;

    // @Column({ nullable: true })
    // CoBuyerOfficeURL: string;

    // @Column({ nullable: true })
    // CoListAgentAOR: string;

    // @Column({ nullable: true })
    // CoListAgentDesignation: string;

    // @Column({ nullable: true })
    // CoListAgentDirectPhone: string;

    // @Column({ nullable: true })
    // CoListAgentEmail: string;

    // @Column({ nullable: true })
    // CoListAgentFax: string;

    // @Column({ nullable: true })
    // CoListAgentFirstName: string;

    // @Column({ nullable: true })
    // CoListAgentFullName: string;

    // @Column({ nullable: true })
    // CoListAgentHomePhone: string;

    // @Column({ nullable: true })
    // CoListAgentKey: string;

    // @Column({ nullable: true })
    // CoListAgentKeyNumeric: number;

    // @Column({ nullable: true })
    // CoListAgentLastName: string;

    // @Column({ nullable: true })
    // CoListAgentMiddleName: string;

    // @Column({ nullable: true })
    // CoListAgentMlsId: string;

    // @Column({ nullable: true })
    // CoListAgentMobilePhone: string;

    // @Column({ nullable: true })
    // CoListAgentNamePrefix: string;

    // @Column({ nullable: true })
    // CoListAgentNameSuffix: string;

    // @Column({ nullable: true })
    // CoListAgentOfficePhone: string;

    // @Column({ nullable: true })
    // CoListAgentOfficePhoneExt: string;

    // @Column({ nullable: true })
    // CoListAgentPager: string;

    // @Column({ nullable: true })
    // CoListAgentPreferredPhone: string;

    // @Column({ nullable: true })
    // CoListAgentPreferredPhoneExt: string;

    // @Column({ nullable: true })
    // CoListAgentStateLicense: string;

    // @Column({ nullable: true })
    // CoListAgentTollFreePhone: string;

    // @Column({ nullable: true })
    // CoListAgentURL: string;

    // @Column({ nullable: true })
    // CoListAgentVoiceMail: string;

    // @Column({ nullable: true })
    // CoListAgentVoiceMailExt: string;

    // @Column({ nullable: true })
    // CoListOfficeAOR: string;

    // @Column({ nullable: true })
    // CoListOfficeEmail: string;

    // @Column({ nullable: true })
    // CoListOfficeFax: string;

    // @Column({ nullable: true })
    // CoListOfficeIDXParticipationYN: boolean;

    // @Column({ nullable: true })
    // CoListOfficeKey: string;

    // @Column({ nullable: true })
    // CoListOfficeKeyNumeric: number;

    // @Column({ nullable: true })
    // CoListOfficeMlsId: string;

    @Column({ nullable: true })
    CoListOfficeName: string;

    // @Column({ nullable: true })
    // CoListOfficePhone: string;

    // @Column({ nullable: true })
    // CoListOfficePhoneExt: string;

    // @Column({ nullable: true })
    // CoListOfficeURL: string;

    @Column({ nullable: true })
    CoexclusiveYN: boolean;

    // @Column({ nullable: true })
    // ColistAgent2Key: string;

    // @Column({ nullable: true })
    // ColistAgent3Key: string;

    @Column({ nullable: true })
    CommercialUnitsYN: boolean;

    @Column({ nullable: true })
    CommonInterest: string;

    @Column({ nullable: true })
    CommonWalls: string;

    @Column({ nullable: true })
    CommunityFeatures: string;

    @Column({ nullable: true })
    CompensationRemarks: string;

    @Column({ nullable: true })
    Concessions: string;

    @Column({ nullable: true, type: 'float4' })
    ConcessionsAmount: number;

    @Column({ nullable: true })
    ConcessionsComments: string;

    @Column({ nullable: true })
    ConstructionMaterials: string;

    @Column({ nullable: true })
    ContinentRegion: string;

    @Column({ nullable: true })
    Contingency: string;

    @Column({ nullable: true, type: 'date' })
    ContingentDate: Date;

    @Column({ nullable: true, type: 'date' })
    ContractStatusChangeDate: Date;

    @Column({ nullable: true })
    Cooling: string;

    @Column({ nullable: true })
    CoolingYN: boolean;

    @Column({ nullable: true })
    CopyrightNotice: string;

    @Column({ nullable: true })
    Country: string;

    @Column({ nullable: true })
    CountryRegion: string;

    @Column({ nullable: true })
    CountyOrParish: string;

    @Column({ nullable: true, type: 'float4' })
    CoveredSpaces: number;

    @Column({ nullable: true, type: 'timestamp' })
    ComingSoonTimestamp: Date;
    @Column({ nullable: true })
    CropsIncludedYN: boolean;

    @Column({ nullable: true })
    CrossStreet: string;

    @Column({ nullable: true, type: 'float4' })
    CultivatedArea: number;

    @Column({ nullable: true, type: 'float4' })
    CumulativeDaysOnMarket: number;

    @Column({ nullable: true })
    CurrentFinancing: string;

    @Column({ nullable: true })
    CurrentUse: string;

    // @Column({ nullable: true })
    // DOH1: string;

    // @Column({ nullable: true })
    // DOH2: string;

    // @Column({ nullable: true })
    // DOH3: string;

    @Column({ nullable: true })
    DaysOnMarket: number;

    @Column({ nullable: true })
    DeliveredVacantYN: boolean;

    @Column({ nullable: true, type: 'float4' })
    DepositAmount: number;

    @Column({ nullable: true })
    DevelopmentStatus: string;

    @Column({ nullable: true })
    DiningType: string;

    @Column({ nullable: true })
    DirectionFaces: string;

    @Column({ nullable: true })
    Directions: string;

    @Column({ nullable: true })
    Disclaimer: string;

    @Column({ nullable: true })
    Disclosures: string;

    // @Column({ nullable: true })
    // DistanceToBusComments: string;

    // @Column({ nullable: true })
    // DistanceToBusNumeric: number;

    // @Column({ nullable: true })
    // DistanceToBusUnits: string;

    // @Column({ nullable: true })
    // DistanceToElectricComments: string;

    // @Column({ nullable: true })
    // DistanceToElectricNumeric: number;

    // @Column({ nullable: true })
    // DistanceToElectricUnits: string;

    // @Column({ nullable: true })
    // DistanceToFreewayComments: string;

    // @Column({ nullable: true })
    // DistanceToFreewayNumeric: number;

    // @Column({ nullable: true })
    // DistanceToFreewayUnits: string;

    // @Column({ nullable: true })
    // DistanceToGasComments: string;

    // @Column({ nullable: true })
    // DistanceToGasNumeric: number;

    // @Column({ nullable: true })
    // DistanceToGasUnits: string;

    // @Column({ nullable: true })
    // DistanceToPhoneServiceComments: string;

    // @Column({ nullable: true })
    // DistanceToPhoneServiceNumeric: number;

    // @Column({ nullable: true })
    // DistanceToPhoneServiceUnits: string;

    // @Column({ nullable: true })
    // DistanceToPlaceofWorshipComments: string;

    // @Column({ nullable: true })
    // DistanceToPlaceofWorshipNumeric: number;

    // @Column({ nullable: true })
    // DistanceToPlaceofWorshipUnits: string;

    // @Column({ nullable: true })
    // DistanceToSchoolBusComments: string;

    // @Column({ nullable: true })
    // DistanceToSchoolBusNumeric: number;

    // @Column({ nullable: true })
    // DistanceToSchoolBusUnits: string;

    // @Column({ nullable: true })
    // DistanceToSchoolsComments: string;

    // @Column({ nullable: true })
    // DistanceToSchoolsNumeric: number;

    // @Column({ nullable: true })
    // DistanceToSchoolsUnits: string;

    // @Column({ nullable: true })
    // DistanceToSewerComments: string;

    // @Column({ nullable: true })
    // DistanceToSewerNumeric: number;

    // @Column({ nullable: true })
    // DistanceToSewerUnits: string;

    // @Column({ nullable: true })
    // DistanceToShoppingComments: string;

    // @Column({ nullable: true })
    // DistanceToShoppingNumeric: number;

    // @Column({ nullable: true })
    // DistanceToShoppingUnits: string;

    // @Column({ nullable: true })
    // DistanceToStreetComments: string;

    // @Column({ nullable: true })
    // DistanceToStreetNumeric: number;

    // @Column({ nullable: true })
    // DistanceToStreetUnits: string;

    // @Column({ nullable: true })
    // DistanceToWaterComments: string;

    // @Column({ nullable: true })
    // DistanceToWaterNumeric: number;

    // @Column({ nullable: true })
    // DistanceToWaterUnits: string;

    @Column({ nullable: true })
    DocumentsAvailable: string;

    @Column({ nullable: true, type: 'timestamp' })
    DocumentsChangeTimestamp: Date;

    @Column({ nullable: true, type: 'float4' })
    DocumentsCount: number;

    @Column({ nullable: true })
    DoorFeatures: string;

    @Column({ nullable: true })
    DualVariableCompensationYN: boolean;

    @Column({ nullable: true })
    Electric: string;

    @Column({ nullable: true, type: 'float4' })
    ElectricExpense: number;

    @Column({ nullable: true })
    ElectricOnPropertyYN: boolean;

    @Column({ nullable: true })
    ElementarySchool: string;

    @Column({ nullable: true })
    ElementarySchoolDistrict: string;

    @Column({ nullable: true, type: 'float4' })
    Elevation: number;

    @Column({ nullable: true, type: 'float4' })
    ElevationUnits: string;

    @Column({ nullable: true, type: 'float4' })
    ElevatorsTotal: number;

    @Column({ nullable: true, type: 'float4' })
    EntryLevel: number;

    @Column({ nullable: true })
    EntryLocation: string;

    @Column({ nullable: true })
    Exclusions: string;

    @Column({ nullable: true })
    ExistingLeaseType: string;

    @Column({ nullable: true, type: 'date' })
    ExpirationDate: Date;

    @Column({ nullable: true })
    Exposures: string;

    @Column({ nullable: true, type: 'float4' })
    ExtensionLength: number;

    @Column({ nullable: true })
    ExteriorFeatures: string;

    @Column({ nullable: true, type: 'float4' })
    FARAsBuilt: number;

    @Column({ nullable: true })
    FarmCreditServiceInclYN: boolean;

    @Column({ nullable: true })
    FarmLandAreaSource: string;

    @Column({ nullable: true })
    FarmLandAreaUnits: string;

    @Column({ nullable: true })
    Fencing: string;

    @Column({ nullable: true })
    FinancialDataSource: string;

    @Column({ nullable: true })
    FireplaceFeatures: string;

    @Column({ nullable: true })
    FireplaceYN: boolean;

    @Column({ nullable: true, type: 'float4' })
    FireplacesTotal: number;

    @Column({ nullable: true })
    FlipTax: string;

    @Column({ nullable: true })
    FlipTaxRemarks: string;

    @Column({ nullable: true })
    FlipTaxType: string;

    @Column({ nullable: true })
    FloorHasLaundryYN: boolean;

    @Column({ nullable: true })
    FloorNumber: string;

    @Column({ nullable: true })
    Flooring: string;

    @Column({ nullable: true, type: 'float4' })
    FoundationArea: number;

    @Column({ nullable: true })
    FoundationDetails: string;

    @Column({ nullable: true })
    FreeRentRemarks: string;

    @Column({ nullable: true })
    FreeRentYN: boolean;

    @Column({ nullable: true })
    FrontageLength: string;

    @Column({ nullable: true })
    FrontageType: string;

    @Column({ nullable: true })
    FuelExpense: number;

    @Column({ nullable: true })
    Furnished: string;

    @Column({ nullable: true, type: 'date' })
    FurnishedAvailabilitydate: Date;

    @Column({ nullable: true, type: 'float4' })
    FurnishedLeaseTermMonths: number;

    @Column({ nullable: true, type: 'float4' })
    FurnishedListPrice: number;

    @Column({ nullable: true, type: 'float4' })
    FurnishedMaxLeaseMonths: number;

    @Column({ nullable: true, type: 'float4' })
    FurnishedMinLeaseMonths: number;

    @Column({ nullable: true, type: 'float4' })
    FurnitureReplacementExpense: number;

    @Column({ nullable: true, type: 'float4' })
    GarageSpaces: number;

    @Column({ nullable: true })
    GarageYN: boolean;

    @Column({ nullable: true, type: 'float4' })
    GardenerExpense: number;

    @Column({ nullable: true })
    GrazingPermitsBlmYN: boolean;

    @Column({ nullable: true })
    GrazingPermitsForestServiceYN: boolean;

    @Column({ nullable: true })
    GrazingPermitsPrivateYN: boolean;

    @Column({ nullable: true })
    GreenBuildingVerificationType: string;

    @Column({ nullable: true })
    GreenEnergyEfficient: string;

    @Column({ nullable: true })
    GreenEnergyGeneration: string;

    @Column({ nullable: true })
    GreenIndoorAirQuality: string;

    @Column({ nullable: true })
    GreenLocation: string;

    @Column({ nullable: true })
    GreenSustainability: string;

    //     @Column({ nullable: true })
    // GreenVerification[Type]Body: string;

    //     @Column({ nullable: true })
    // GreenVerification[Type]Metric: number;

    //     @Column({ nullable: true })
    // GreenVerification[Type]Rating: string;

    //     @Column({ nullable: true })
    // GreenVerification[Type]Source: string

    //     @Column({ nullable: true })
    // GreenVerification[Type]Status: string

    //     @Column({ nullable: true })
    // GreenVerification[Type]URL: string;

    //     @Column({ nullable: true })
    // GreenVerification[Type]Version: string;

    //     @Column({ nullable: true })
    // GreenVerification[Type]Year: number;

    @Column({ nullable: true })
    GreenWaterConservation: string;

    @Column({ nullable: true, type: 'float4' })
    GrossIncome: number;

    @Column({ nullable: true, type: 'float4' })
    GrossScheduledIncome: number;

    @Column({ nullable: true })
    GuarantorsAcceptedYN: boolean;

    @Column({ nullable: true })
    HabitableResidenceYN: boolean;

    @Column({ nullable: true })
    Heating: string;

    @Column({ nullable: true })
    HeatingYN: boolean;

    @Column({ nullable: true })
    HighSchool: string;

    @Column({ nullable: true })
    HighSchoolDistrict: string;

    @Column({ nullable: true })
    HomeWarrantyYN: boolean;

    @Column({ nullable: true })
    HorseAmenities: string;

    @Column({ nullable: true })
    HorseYN: boolean;

    @Column({ nullable: true })
    HoursDaysOfOperation: string;

    @Column({ nullable: true })
    HoursDaysOfOperationDescription: string;

    @Column({ nullable: true })
    IDXEntireListingDisplayYN: boolean;

    @Column({ nullable: true })
    Inclusions: string;

    @Column({ nullable: true })
    IncomeIncludes: string;

    @Column({ nullable: true, type: 'float4' })
    InsuranceExpense: number;

    @Column({ nullable: true })
    InteriorFeatures: string;

    @Column({ nullable: true })
    InternetAddressDisplayYN: boolean;

    @Column({ nullable: true })
    InternetAutomatedValuationDisplayYN: boolean;

    @Column({ nullable: true })
    InternetConsumerCommentYN: boolean;

    @Column({ nullable: true })
    InternetEntireListingDisplayYN: boolean;

    @Column({ nullable: true })
    IrrigationSource: string;

    @Column({ nullable: true, type: 'float4' })
    IrrigationWaterRightsAcres: number;

    @Column({ nullable: true })
    IrrigationWaterRightsYN: boolean;

    @Column({ nullable: true })
    KitchenCondition: string;

    @Column({ nullable: true })
    LaborInformation: string;

    @Column({ nullable: true, type: 'float4' })
    LandLeaseAmount: number;

    @Column({ nullable: true })
    LandLeaseAmountFrequency: string;

    @Column({ nullable: true, type: 'date' })
    LandLeaseExpirationDate: Date;

    @Column({ nullable: true })
    LandLeaseYN: boolean;

    @Column({ nullable: true })
    LandmarkStatusYN: boolean;

    @Column({ nullable: true })
    Latitude: string;

    @Column({ nullable: true })
    LaundryFeatures: string;

    @Column({ nullable: true, type: 'float4' })
    LeasableArea: number;

    @Column({ nullable: true })
    LeasableAreaUnits: string;

    @Column({ nullable: true, type: 'float4' })
    LeaseAmount: number;

    @Column({ nullable: true })
    LeaseAmountFrequency: string;

    @Column({ nullable: true })
    LeaseAssignableYN: boolean;

    @Column({ nullable: true })
    LeaseConsideredYN: boolean;

    @Column({ nullable: true, type: 'date' })
    LeaseExpiration: Date;

    @Column({ nullable: true })
    LeaseRenewalCompensation: string;

    @Column({ nullable: true })
    LeaseRenewalOptionYN: boolean;

    @Column({ nullable: true })
    LeaseTerm: string;

    @Column({ nullable: true })
    LeaseType: string;

    @Column({ nullable: true })
    Levels: string;

    @Column({ nullable: true })
    License1: string;

    @Column({ nullable: true })
    License2: string;

    @Column({ nullable: true })
    License3: string;

    @Column({ nullable: true, type: 'float4' })
    LicensesExpense: number;

    @Column({ nullable: true })
    ListAOR: string;

    // @Column({ nullable: true })
    // ListAgentAOR: string;

    // @Column({ nullable: true })
    // ListAgentDesignation: string;

    // @Column({ nullable: true })
    // ListAgentDirectPhone: string;

    // @Column({ nullable: true })
    // ListAgentEmail: string;

    // @Column({ nullable: true })
    // ListAgentFax: string;

    // @Column({ nullable: true })
    // ListAgentFirstName: string;

    // @Column({ nullable: true })
    // ListAgentFullName: string;

    // @Column({ nullable: true })
    // ListAgentHomePhone: string;

    // @Column({ nullable: true })
    // ListAgentKey: string;

    // @Column({ nullable: true })
    // ListAgentKeyNumeric: number;

    // @Column({ nullable: true })
    // ListAgentLastName: string;

    // @Column({ nullable: true })
    // ListAgentMiddleName: string;

    // @Column({ nullable: true })
    // ListAgentMlsId: string;

    // @Column({ nullable: true })
    // ListAgentMobilePhone: string;

    // @Column({ nullable: true })
    // ListAgentNamePrefix: string;

    // @Column({ nullable: true })
    // ListAgentNameSuffix: string;

    // @Column({ nullable: true })
    // ListAgentOfficePhone: string;

    // @Column({ nullable: true })
    // ListAgentOfficePhoneExt: string;

    // @Column({ nullable: true })
    // ListAgentPager: string;

    // @Column({ nullable: true })
    // ListAgentPreferredPhone: string;

    // @Column({ nullable: true })
    // ListAgentPreferredPhoneExt: string;

    // @Column({ nullable: true })
    // ListAgentStateLicense: string;

    // @Column({ nullable: true })
    // ListAgentTollFreePhone: string;

    // @Column({ nullable: true })
    // ListAgentURL: string;

    // @Column({ nullable: true })
    // ListAgentVoiceMail: string;

    // @Column({ nullable: true })
    // ListAgentVoiceMailExt: string;

    // @Column({ nullable: true })
    // ListOfficeAOR: string;

    // @Column({ nullable: true })
    // ListOfficeEmail: string;

    // @Column({ nullable: true })
    // ListOfficeFax: string;

    // @Column({ nullable: true })
    // ListOfficeIDXParticipationYN: boolean;

    // @Column({ nullable: true })
    // ListOfficeKey: string;

    // @Column({ nullable: true })
    // ListOfficeKeyNumeric: number;

    // @Column({ nullable: true })
    // ListOfficeMlsId: string;

    @Column({ nullable: true })
    ListOfficeName: string;

    // @Column({ nullable: true })
    // ListOfficePhone: string;

    // @Column({ nullable: true })
    // ListOfficePhoneExt: string;

    @Column({ nullable: true })
    ListOfficeURL: string;

    @Column({ nullable: true, type: 'float4' })
    ListPrice: number;

    @Column({ nullable: true, type: 'float4' })
    ListPriceLow: number;

    @Column({ nullable: true })
    ListTeamKey: string;

    @Column({ nullable: true, type: 'float4' })
    ListTeamKeyNumeric: number;

    @Column({ nullable: true })
    ListTeamName: string;

    @Column({ nullable: true })
    ListingAgreement: string;

    @Column({ nullable: true, type: 'date' })
    ListingContractDate: Date;

    @Column({ nullable: true })
    ListingId: string;

    @Column({ nullable: true })
    ListingService: string;

    @Column({ nullable: true })
    ListingSocialMedia: string;

    @Column({ nullable: true })
    ListingTerms: string;

    @Column({ nullable: true })
    ListingURL: string;

    @Column({ nullable: true, type: 'float4' })
    LivingArea: number;

    @Column({ nullable: true })
    LivingAreaSource: string;

    @Column({ nullable: true })
    LivingAreaUnits: string;

    @Column({ nullable: true })
    LockBoxLocation: string;

    @Column({ nullable: true })
    LockBoxSerialNumber: string;

    @Column({ nullable: true })
    LockBoxType: string;

    @Column({ nullable: true })
    Longitude: string;

    @Column({ nullable: true })
    LotDimensionsSource: string;

    @Column({ nullable: true })
    LotFeatures: string;

    @Column({ nullable: true, type: 'float4' })
    LotSizeAcres: number;

    @Column({ nullable: true, type: 'float4' })
    LotSizeArea: number;

    @Column({ nullable: true })
    LotSizeDimensions: string;

    @Column({ nullable: true })
    LotSizeSource: string;

    @Column({ nullable: true, type: 'float4' })
    LotSizeSquareFeet: number;

    @Column({ nullable: true })
    LotSizeUnits: string;

    @Column({ nullable: true })
    MLSAreaMajor: string;

    @Column({ nullable: true })
    MLSAreaMinor: string;

    @Column({ nullable: true, type: 'float4' })
    MainLevelBathrooms: number;

    @Column({ nullable: true, type: 'float4' })
    MainLevelBedrooms: number;

    @Column({ nullable: true, type: 'float4' })
    MaintenanceExpense: number;

    @Column({ nullable: true, type: 'timestamp' })
    MajorChangeTimestamp: Date;

    @Column({ nullable: true })
    MajorChangeType: string;

    @Column({ nullable: true })
    Make: string;

    @Column({ nullable: true, type: 'float4' })
    ManagerExpense: number;

    @Column({ nullable: true })
    ManagingAgencyListingYN: boolean;

    @Column({ nullable: true })
    MapCoordinate: string;

    @Column({ nullable: true })
    MapCoordinateSource: string;

    @Column({ nullable: true })
    MapURL: string;

    @Column({ nullable: true, type: 'float4' })
    MaxLeaseMonths: number;

    @Column({ nullable: true })
    MaximumFinancingAmount: number;

    @Column({ nullable: true, type: 'float4' })
    MaximumFinancingPercent: number;

    @Column({ nullable: true })
    MaximumFinancingRemarks: string;

    @Column({ nullable: true })
    MiddleOrJuniorSchool: string;

    @Column({ nullable: true })
    MiddleOrJuniorSchoolDistrict: string;

    @Column({ nullable: true, type: 'float4' })
    MinLeaseMonths: number;

    @Column({ nullable: true })
    MlsStatus: string;

    @Column({ nullable: true })
    MobileDimUnits: string;

    @Column({ nullable: true })
    MobileHomeRemainsYN: boolean;

    @Column({ nullable: true, type: 'float4' })
    MobileLength: number;

    @Column({ nullable: true })
    MobileWidth: number;

    @Column({ nullable: true })
    Model: string;

    @Column({ nullable: true, type: 'timestamp' })
    ModificationTimestamp: Date;

    @Column({ nullable: true, type: 'float4' })
    NetMonthlyRent: number;

    @Column({ nullable: true, type: 'float4' })
    NetOperatingIncome: number;

    @Column({ nullable: true })
    NewConstructionYN: boolean;

    @Column({ nullable: true })
    NewDevelopmentYN: boolean;

    @Column({ nullable: true, type: 'float4' })
    NewTaxesExpense: number;

    @Column({ nullable: true, type: 'float4' })
    NumberOfBuildings: number;

    @Column({ nullable: true, type: 'float4' })
    NumberOfFullTimeEmployees: number;

    @Column({ nullable: true, type: 'float4' })
    NumberOfLots: number;

    @Column({ nullable: true, type: 'float4' })
    NumberOfPads: number;

    @Column({ nullable: true, type: 'float4' })
    NumberOfPartTimeEmployees: number;

    @Column({ nullable: true, type: 'float4' })
    NumberOfSeparateElectricMeters: number;

    @Column({ nullable: true, type: 'float4' })
    NumberOfSeparateGasMeters: number;

    @Column({ nullable: true, type: 'float4' })
    NumberOfSeparateWaterMeters: number;

    @Column({ nullable: true, type: 'float4' })
    NumberOfShares: number;

    @Column({ nullable: true, type: 'float4' })
    NumberOfUnitsInCommunity: number;

    @Column({ nullable: true, type: 'float4' })
    NumberOfUnitsLeased: number;

    @Column({ nullable: true, type: 'float4' })
    NumberOfUnitsMoMo: number;

    @Column({ nullable: true, type: 'float4' })
    NumberOfUnitsTotal: number;

    @Column({ nullable: true, type: 'float4' })
    NumberOfUnitsVacant: number;

    @Column({ nullable: true })
    OccupantName: string;

    @Column({ nullable: true })
    OccupantPhone: string;

    @Column({ nullable: true })
    OccupantType: string;

    @Column({ nullable: true, type: 'date' })
    OffMarketDate: Date;

    @Column({ nullable: true, type: 'timestamp' })
    OffMarketTimestamp: Date;

    @Column({ nullable: true, type: 'date' })
    OnMarketDate: Date;

    @Column({ nullable: true, type: 'timestamp' })
    OnMarketTimestamp: Date;
    @Column({ nullable: true, type: 'float4' })
    OpenParkingSpaces: number;

    @Column({ nullable: true })
    OpenParkingYN: boolean;

    @Column({ nullable: true, type: 'float4' })
    OperatingExpense: number;

    @Column({ nullable: true })
    OperatingExpenseIncludes: string;

    @Column({ nullable: true })
    OriginalBuildingLegalRoomsTotal: string;

    @Column({ nullable: true, type: 'timestamp' })
    OriginalEntryTimestamp: Date;

    @Column({ nullable: true })
    OriginalLegalRoomsTotal: string;

    @Column({ nullable: true, type: 'float4' })
    OriginalListPrice: number;

    @Column({ nullable: true })
    OriginatingSystemID: string;

    @Column({ nullable: true })
    OriginatingSystemKey: string;

    @Column({ nullable: true })
    OriginatingSystemName: string;

    @Column({ nullable: true })
    OtherEquipment: string;

    @Column({ nullable: true, type: 'float4' })
    OtherExpense: number;

    @Column({ nullable: true })
    OtherParking: string;

    @Column({ nullable: true })
    OtherStructures: string;

    @Column({ nullable: true })
    OwnerName: string;

    @Column({ nullable: true })
    OwnerPays: string;

    @Column({ nullable: true })
    OwnerPaysPlusConcessionsYN: boolean;

    @Column({ nullable: true })
    OwnerPaysRemarks: string;

    @Column({ nullable: true })
    OwnerPaysToCoBrokerYN: boolean;

    @Column({ nullable: true })
    OwnerPhone: string;

    @Column({ nullable: true })
    Ownership: string;

    @Column({ nullable: true })
    OwnershipType: string;

    @Column({ nullable: true })
    ParcelNumber: string;

    @Column({ nullable: true })
    ParkManagerName: string;

    @Column({ nullable: true })
    ParkManagerPhone: string;

    @Column({ nullable: true })
    ParkName: string;

    @Column({ nullable: true })
    ParkingFeatures: string;

    @Column({ nullable: true })
    PartialView: string;

    @Column({ nullable: true, type: 'float4' })
    ParkingTotal: number;

    @Column({ nullable: true, type: 'float4' })
    PastureArea: number;

    @Column({ nullable: true })
    PatioAndPorchFeatures: string;

    @Column({ nullable: true, type: 'timestamp' })
    PendingTimestamp: Date;

    @Column({ nullable: true, type: 'float4' })
    PercentOfCommonElements: number;

    @Column({ nullable: true, type: 'float4' })
    PestControlExpense: number;

    @Column({ nullable: true })
    PetPolicyRemarks: string;

    @Column({ nullable: true })
    PetsAllowed: string;

    @Column({ nullable: true, type: 'timestamp' })
    PhotosChangeTimestamp: Date;

    @Column({ nullable: true, type: 'float4' })
    PhotosCount: number;

    @Column({ nullable: true, type: 'float4' })
    PoolExpense: number;

    @Column({ nullable: true })
    PoolFeatures: string;

    @Column({ nullable: true })
    PoolPrivateYN: boolean;

    @Column({ nullable: true })
    Possession: string;

    @Column({ nullable: true })
    PossibleUse: string;

    @Column({ nullable: true })
    PostalCity: string;

    @Column({ nullable: true })
    PostalCode: string;

    @Column({ nullable: true })
    PostalCodePlus4: string;

    @Column({ nullable: true })
    PowerProductionType: string;

    //     @Column({ nullable: true })
    // PowerProduction[Type]Annual: number;

    //     @Column({ nullable: true })
    // PowerProduction[Type]AnnualStatus: string

    //     @Column({ nullable: true })
    // PowerProduction[Type]Size: number;

    //     @Column({ nullable: true })
    // PowerProduction[Type]YearInstall: number;

    @Column({ nullable: true, type: 'float4' })
    PreviousListPrice: number;

    @Column({ nullable: true, type: 'timestamp' })
    PriceChangeTimestamp: Date;

    @Column({ nullable: true })
    PrivateOfficeRemarks: string;

    @Column({ nullable: true })
    PrivateRemarks: string;

    @Column({ nullable: true, type: 'float4' })
    ProfessionalManagementExpense: number;

    @Column({ nullable: true })
    PropertyAttachedYN: boolean;

    @Column({ nullable: true })
    PropertyCondition: string;

    @Column({ nullable: true })
    PropertySubType: string;

    @Column({ nullable: true })
    PropertyType: string;

    @Column({ nullable: true })
    PublicRemarks: string;

    @Column({ nullable: true })
    PublicSurveyRange: string;

    @Column({ nullable: true })
    PublicSurveySection: string;

    @Column({ nullable: true })
    PublicSurveyTownship: string;

    @Column({ nullable: true, type: 'date' })
    PurchaseContractDate: Date;

    @Column({ nullable: true })
    RVParkingDimensions: string;

    @Column({ nullable: true, type: 'float4' })
    RangeArea: number;

    @Column({ nullable: true })
    RentControlYN: boolean;

    @Column({ nullable: true })
    RentIncludes: string;

    @Column({ nullable: true })
    RentalCompensationType: string;

    @Column({ nullable: true })
    RentingAllowedYN: boolean;

    @Column({ nullable: true })
    RoadFrontageType: string;

    @Column({ nullable: true })
    RoadResponsibility: string;

    @Column({ nullable: true })
    RoadSurfaceType: string;

    @Column({ nullable: true })
    Roof: string;

    @Column({ nullable: true })
    RoofRightsYN: boolean;

    @Column({ nullable: true })
    RoomType: string;

    //     @Column({ nullable: true })
    // Room[type]Area: number;

    //     @Column({ nullable: true })
    // Room[type]AreaSource: string

    //     @Column({ nullable: true })
    // Room[type]AreaUnits: string

    //     @Column({ nullable: true })
    // Room[type]Description: string;

    //     @Column({ nullable: true })
    // Room[type]Dimensions: string;

    //     @Column({ nullable: true })
    // Room[type]Features: string

    //     @Column({ nullable: true })
    // Room[type]Length: number;

    //     @Column({ nullable: true })
    // Room[type]LengthWidthUnits: string

    //     @Column({ nullable: true })
    // Room[type]Width: number;

    @Column({ nullable: true, type: 'float4' })
    RoomsTotal: number;

    @Column({ nullable: true, type: 'float4' })
    SeatingCapacity: number;

    @Column({ nullable: true })
    SecurityFeatures: string;

    @Column({ nullable: true })
    SeniorCommunityYN: boolean;

    @Column({ nullable: true })
    SerialU: string;

    @Column({ nullable: true })
    SerialX: string;

    @Column({ nullable: true })
    SerialXX: string;

    @Column({ nullable: true })
    Sewer: string;

    @Column({ nullable: true, type: 'float4' })
    ShowingAdvanceNotice: number;

    @Column({ nullable: true })
    ShowingAttendedYN: boolean;

    @Column({ nullable: true })
    ShowingContactName: string;

    @Column({ nullable: true })
    ShowingContactPhone: string;

    @Column({ nullable: true })
    ShowingContactPhoneExt: string;

    @Column({ nullable: true })
    ShowingContactType: string;

    @Column({ nullable: true })
    ShowingDays: string;

    @Column({ nullable: true, type: 'timestamp' })
    ShowingEndTime: Date;

    @Column({ nullable: true })
    ShowingInstructions: string;

    @Column({ nullable: true })
    ShowingRequirements: string;

    @Column({ nullable: true, type: 'timestamp' })
    ShowingStartTime: Date;

    @Column({ nullable: true })
    SignOnPropertyYN: boolean;

    @Column({ nullable: true })
    Skirt: string;

    @Column({ nullable: true })
    SourceSystemID: string;

    @Column({ nullable: true })
    SourceSystemKey: string;

    @Column({ nullable: true })
    SourceSystemName: string;

    @Column({ nullable: true })
    SpaFeatures: string;

    @Column({ nullable: true })
    SpaYN: boolean;

    @Column({ nullable: true })
    SpecialLicenses: string;

    @Column({ nullable: true })
    SpecialListingConditions: string;

    @Column({ nullable: true })
    SponsorUnitYN: boolean;

    @Column({ nullable: true })
    StandardStatus: string;

    @Column({ nullable: true })
    StateOrProvince: string;

    @Column({ nullable: true })
    StateRegion: string;

    @Column({ nullable: true, type: 'timestamp' })
    StatusChangeTimestamp: Date;

    @Column({ nullable: true, type: 'float4' })
    Stories: number;

    @Column({ nullable: true, type: 'float4' })
    StoriesTotal: number;

    @Column({ nullable: true })
    StreetAdditionalInfo: string;

    @Column({ nullable: true })
    StreetDirPrefix: string;

    @Column({ nullable: true })
    StreetDirSuffix: string;

    @Column({ nullable: true })
    StreetName: string;

    @Column({ nullable: true })
    StreetNumber: string;

    @Column({ nullable: true, type: 'float4' })
    StreetNumberNumeric: number;

    @Column({ nullable: true })
    StreetSuffix: string;

    @Column({ nullable: true })
    StreetSuffixModifier: string;

    @Column({ nullable: true })
    StructureType: string;

    @Column({ nullable: true })
    SubAgencyCompensation: string;

    @Column({ nullable: true })
    SubAgencyCompensationType: string;

    @Column({ nullable: true })
    SubdivisionName: string;

    @Column({ nullable: true, type: 'float4' })
    SuppliesExpense: number;

    @Column({ nullable: true })
    SyndicateTo: string;

    @Column({ nullable: true })
    SyndicateYN: boolean;

    @Column({ nullable: true })
    SyndicationRemarks: string;

    @Column({ nullable: true, type: 'float4' })
    TaxAnnualAmount: number;

    @Column({ nullable: true, type: 'float4' })
    TaxAssessedValue: number;

    @Column({ nullable: true })
    TaxBlock: string;

    @Column({ nullable: true })
    TaxBookNumber: string;

    @Column({ nullable: true, type: 'float4' })
    TaxDeductionAmount: number;

    @Column({ nullable: true, type: 'float4' })
    TaxDeductionPercent: number;

    @Column({ nullable: true })
    TaxDeductionRemarks: string;

    @Column({ nullable: true })
    TaxLegalDescription: string;

    @Column({ nullable: true })
    TaxLot: string;

    @Column({ nullable: true })
    TaxMapNumber: string;

    @Column({ nullable: true, type: 'float4' })
    TaxOtherAnnualAssessmentAmount: number;

    @Column({ nullable: true })
    TaxParcelLetter: string;

    @Column({ nullable: true })
    TaxStatusCurrent: string;

    @Column({ nullable: true })
    TaxTract: string;

    @Column({ nullable: true, type: 'float4' })
    TaxYear: number;

    @Column({ nullable: true, type: 'date' })
    TenantLeaseExpiresDate: Date;

    @Column({ nullable: true })
    TenantPays: string;

    @Column({ nullable: true })
    Topography: string;

    @Column({ nullable: true, type: 'float4' })
    TotalActualRent: number;

    @Column({ nullable: true, type: 'float4' })
    TotalHomeOffices: number;

    @Column({ nullable: true })
    Township: string;

    @Column({ nullable: true })
    TransactionBrokerCompensation: string;

    @Column({ nullable: true })
    TransactionBrokerCompensationType: string;

    @Column({ nullable: true, type: 'float4' })
    TrashExpense: number;

    @Column({ nullable: true })
    UnitLine: string;

    @Column({ nullable: true })
    UnitNumber: string;

    @Column({ nullable: true })
    UnitTypeType: string;

    //     @Column({ nullable: true })
    // UnitType[type]ActualRent: number;

    //     @Column({ nullable: true })
    // UnitType[type]BathsTotal: number;

    //     @Column({ nullable: true })
    // UnitType[type]BedsTotal: number;

    //     @Column({ nullable: true })
    // UnitType[type]Description: string;

    //     @Column({ nullable: true })
    // UnitType[type]Furnished: string

    //     @Column({ nullable: true })
    // UnitType[type]GarageAttachedYN: boolean;

    //     @Column({ nullable: true })
    // UnitType[type]GarageSpaces: number;

    //     @Column({ nullable: true })
    // UnitType[type]ProForma: number;

    //     @Column({ nullable: true })
    // UnitType[type]TotalRent: number;

    //     @Column({ nullable: true })
    // UnitType[type]UnitsTotal: number;

    @Column({ nullable: true })
    UnitsFurnished: string;

    @Column({ nullable: true })
    UniversalPropertyId: string;

    @Column({ nullable: true })
    UniversalPropertySubId: string;

    @Index('PROPERTY_ENTITY_UNPARSED_ADDRESS_INDEX')
    @Column({ nullable: true })
    UnparsedAddress: string;

    @Index('PROPERTY_ENTITY_ADDRESS_WITH_UNIT')
    @Column({ nullable: true })
    AddressWithUnit: string;

    @Column({ nullable: true })
    Utilities: string;

    @Column({ nullable: true, type: 'float4' })
    VacancyAllowance: number;

    @Column({ nullable: true, type: 'float4' })
    VacancyAllowanceRate: number;

    @Column({ nullable: true })
    Vegetation: string;

    @Column({ nullable: true })
    VendorIgnoreUpdateYN: boolean;

    @Column({ nullable: true, type: 'timestamp' })
    VideosChangeTimestamp: Date;

    @Column({ nullable: true, type: 'float4' })
    VideosCount: number;

    @Column({ nullable: true })
    View: string;

    @Column({ nullable: true })
    ViewRemarks: string;

    @Column({ nullable: true })
    ViewYN: boolean;

    @Column({ nullable: true })
    VirtualTourURLBranded: string;

    @Column({ nullable: true })
    VirtualTourURLUnbranded: string;

    @Column({ nullable: true, type: 'float4' })
    WalkScore: number;

    @Column({ nullable: true })
    WaterBodyName: string;

    @Column({ nullable: true, type: 'float4' })
    WaterSewerExpense: number;

    @Column({ nullable: true })
    WaterSource: string;

    @Column({ nullable: true })
    WaterfrontFeatures: string;

    @Column({ nullable: true })
    WaterfrontYN: boolean;

    @Column({ nullable: true })
    WindowFeatures: string;

    @Column({ nullable: true, type: 'date' })
    WithdrawnDate: Date;

    @Column({ nullable: true, type: 'float4' })
    WoodedArea: number;

    @Column({ nullable: true, type: 'float4' })
    WorkmansCompensationExpense: number;

    @Column({ nullable: true, type: 'float4' })
    YearBuilt: number;

    @Column({ nullable: true })
    YearBuiltDetails: string;

    @Column({ nullable: true, type: 'float4' })
    YearBuiltEffective: number;

    @Column({ nullable: true })
    YearBuiltSource: string;

    @Column({ nullable: true, type: 'float4' })
    YearEstablished: number;

    @Column({ nullable: true, type: 'float4' })
    YearsCurrentOwner: number;

    @Column({ nullable: true })
    Zoning: string;

    @Column({ nullable: true })
    ZoningDescription: string;

    @Column({ nullable: true, array: true })
    MediaURL: string;

    @Column({ nullable: true, array: true })
    FloorPlanMediaURL: string;

    @Column({ nullable: true, type: 'date' })
    DaysOnMarketReplicationDate: Date;

    @Column({ nullable: true })
    PropertySubTypeAdditional: string;

    @Column({ nullable: true })
    Permission: string;

    @Column({ nullable: true })
    OriginatingSystemSubName: string;

    @Column({ nullable: true })
    DaysOnMarketReplicationIncreasingYN: boolean;

    @Column({ nullable: true, type: 'float4' })
    SecurityDeposit: number;

    public static fromDtoToEntity(property: any): PropertyEntity {
        let propertyEntity = new PropertyEntity();

        propertyEntity.ListingKey = property.ListingKey;
        propertyEntity.AssociationFeeIncludes = property.AssociationFeeIncludes;
        propertyEntity.AvailabilityDate = property.AvailabilityDate;
        propertyEntity.BuildingFeatures = property.BuildingFeatures;
        propertyEntity.CityRegion = property.CityRegion;
        propertyEntity.CommonInterest = property.CommonInterest;
        propertyEntity.CountyOrParish = property.CountyOrParish;
        propertyEntity.CrossStreet = property.CrossStreet;
        propertyEntity.Flooring = property.Flooring;
        propertyEntity.Furnished = property.Furnished;
        propertyEntity.GarageYN = property.GarageYN;
        propertyEntity.Heating = property.Heating;
        propertyEntity.InteriorFeatures = property.InteriorFeatures;
        propertyEntity.InternetAutomatedValuationDisplayYN = property.InternetAutomatedValuationDisplayYN;
        propertyEntity.InternetConsumerCommentYN = property.InternetConsumerCommentYN;
        propertyEntity.LaundryFeatures = property.LaundryFeatures;
        propertyEntity.ListOfficeName = property.ListOfficeName;
        propertyEntity.ListPrice = property.ListPrice;
        propertyEntity.ListingAgreement = property.ListingAgreement;
        propertyEntity.ListingContractDate = property.ListingContractDate;
        propertyEntity.ListingId = property.ListingId;
        propertyEntity.ListingURL = property.ListingURL;
        propertyEntity.LivingAreaUnits = property.LivingAreaUnits;
        propertyEntity.MajorChangeTimestamp = property.MajorChangeTimestamp;
        propertyEntity.MajorChangeType = property.MajorChangeType;
        propertyEntity.ModificationTimestamp = property.ModificationTimestamp;
        propertyEntity.OnMarketDate = property.OnMarketDate;
        propertyEntity.OnMarketTimestamp = property.OnMarketTimestamp;
        propertyEntity.OriginalEntryTimestamp = property.OriginalEntryTimestamp;
        propertyEntity.OriginalListPrice = property.OriginalListPrice;
        propertyEntity.OriginatingSystemID = property.OriginatingSystemID;
        propertyEntity.OriginatingSystemKey = property.OriginatingSystemKey;
        propertyEntity.OriginatingSystemName = property.OriginatingSystemName;
        propertyEntity.PetsAllowed = property.PetsAllowed;
        propertyEntity.PhotosChangeTimestamp = property.PhotosChangeTimestamp;
        propertyEntity.PostalCity = property.PostalCity;
        propertyEntity.PostalCode = property.PostalCode;
        propertyEntity.PreviousListPrice = property.PreviousListPrice;
        propertyEntity.PriceChangeTimestamp = property.PriceChangeTimestamp;
        propertyEntity.PropertySubType = property.PropertySubType;
        propertyEntity.PropertyType = property.PropertyType;
        propertyEntity.PublicRemarks = property.PublicRemarks;
        propertyEntity.SourceSystemID = property.SourceSystemID;
        propertyEntity.SourceSystemKey = property.SourceSystemKey;
        propertyEntity.StandardStatus = property.StandardStatus;
        propertyEntity.StateOrProvince = property.StateOrProvince;
        propertyEntity.StreetName = property.StreetName;
        propertyEntity.StreetNumber = property.StreetNumber;
        propertyEntity.StreetSuffix = property.StreetSuffix;
        propertyEntity.StructureType = property.StructureType;
        propertyEntity.SubdivisionName = property.SubdivisionName;
        propertyEntity.TaxBlock = property.TaxBlock;
        propertyEntity.TaxLot = property.TaxLot;
        propertyEntity.UnitNumber = property.UnitNumber;
        propertyEntity.UnparsedAddress = `${property.StreetNumber} ${property.StreetName}`;
        propertyEntity.VirtualTourURLUnbranded = property.VirtualTourURLUnbranded;
        propertyEntity.MediaURL = property.MediaURL;
        propertyEntity.FloorPlanMediaURL = property.FloorPlanMediaURL;
        propertyEntity.DaysOnMarketReplicationDate = property.DaysOnMarketReplicationDate;
        propertyEntity.PropertySubTypeAdditional = property.PropertySubTypeAdditional;
        propertyEntity.Permission = property.Permission;
        propertyEntity.OriginatingSystemSubName = property.OriginatingSystemSubName;
        propertyEntity.DaysOnMarketReplicationIncreasingYN = property.DaysOnMarketReplicationIncreasingYN;
        propertyEntity.AssociationFeeFrequency = property.AssociationFeeFrequency;
        propertyEntity.Basement = property.Basement;
        propertyEntity.BuildingName = property.BuildingName;
        propertyEntity.BuyerAgencyCompensationType = property.BuyerAgencyCompensationType;
        // propertyEntity.Latitude = property.Latitude;
        // propertyEntity.Longitude = property.Longitude;
        propertyEntity.PatioAndPorchFeatures = property.PatioAndPorchFeatures;
        propertyEntity.SpecialListingConditions = property.SpecialListingConditions;
        propertyEntity.Zoning = property.Zoning;
        propertyEntity.Appliances = property.Appliances;
        propertyEntity.ArchitecturalStyle = property.ArchitecturalStyle;
        propertyEntity.CoListOfficeName = property.CoListOfficeName;
        propertyEntity.AssociationFee = property.AssociationFee;
        propertyEntity.Cooling = property.Cooling;
        propertyEntity.ExteriorFeatures = property.ExteriorFeatures;
        propertyEntity.StatusChangeTimestamp = property.StatusChangeTimestamp;
        propertyEntity.View = property.View;
        propertyEntity.ViewYN = property.ViewYN;
        propertyEntity.LivingArea = property.LivingArea;
        propertyEntity.CoolingYN = property.CoolingYN;
        propertyEntity.StreetDirPrefix = property.StreetDirPrefix;
        propertyEntity.BasementYN = property.BasementYN;
        propertyEntity.CurrentUse = property.CurrentUse;
        propertyEntity.DevelopmentStatus = property.DevelopmentStatus;
        propertyEntity.HeatingYN = property.HeatingYN;
        propertyEntity.LotFeatures = property.LotFeatures;
        propertyEntity.LotSizeDimensions = property.LotSizeDimensions;
        propertyEntity.LotSizeUnits = property.LotSizeUnits;
        propertyEntity.WindowFeatures = property.WindowFeatures;
        propertyEntity.SecurityDeposit = property.SecurityDeposit;
        propertyEntity.BuyerAgencyCompensation = property.BuyerAgencyCompensation;
        propertyEntity.PurchaseContractDate = property.PurchaseContractDate;
        propertyEntity.ParkingFeatures = property.ParkingFeatures;
        propertyEntity.TaxAnnualAmount = property.TaxAnnualAmount;
        propertyEntity.Levels = property.Levels;
        propertyEntity.BuildingAreaUnits = property.BuildingAreaUnits;
        propertyEntity.NewConstructionYN = property.NewConstructionYN;
        propertyEntity.CommunityFeatures = property.CommunityFeatures;
        propertyEntity.SpaFeatures = property.SpaFeatures;
        propertyEntity.FireplaceFeatures = property.FireplaceFeatures;
        propertyEntity.FireplaceYN = property.FireplaceYN;
        propertyEntity.LandLeaseExpirationDate = property.LandLeaseExpirationDate;
        propertyEntity.LandLeaseYN = property.LandLeaseYN;
        propertyEntity.LeaseTerm = property.LeaseTerm;
        propertyEntity.AssociationFee2 = property.AssociationFee2;
        propertyEntity.AssociationFee2Frequency = property.AssociationFee2Frequency;
        propertyEntity.OtherEquipment = property.OtherEquipment;
        propertyEntity.PendingTimestamp = property.PendingTimestamp;
        propertyEntity.DirectionFaces = property.DirectionFaces;
        propertyEntity.OwnerPays = property.OwnerPays;
        propertyEntity.StreetDirSuffix = property.StreetDirSuffix;
        propertyEntity.RoomType = property.RoomType;
        propertyEntity.OtherStructures = property.OtherStructures;
        propertyEntity.ShowingContactName = property.ShowingContactName;
        propertyEntity.ShowingContactPhone = property.ShowingContactPhone;
        propertyEntity.AssociationName = property.AssociationName;
        propertyEntity.ConstructionMaterials = property.ConstructionMaterials;
        propertyEntity.Exclusions = property.Exclusions;
        propertyEntity.Inclusions = property.Inclusions;
        propertyEntity.SecurityFeatures = property.SecurityFeatures;
        propertyEntity.PoolFeatures = property.PoolFeatures;
        propertyEntity.SpaYN = property.SpaYN;
        propertyEntity.LotDimensionsSource = property.LotDimensionsSource;
        propertyEntity.LotSizeSource = property.LotSizeSource;
        propertyEntity.AttachedGarageYN = property.AttachedGarageYN;
        propertyEntity.CarportYN = property.CarportYN;
        propertyEntity.LeaseRenewalCompensation = property.LeaseRenewalCompensation;
        propertyEntity.AccessibilityFeatures = property.AccessibilityFeatures;
        propertyEntity.VirtualTourURLBranded = property.VirtualTourURLBranded;
        propertyEntity.GreenEnergyEfficient = property.GreenEnergyEfficient;
        propertyEntity.CloseDate = property.CloseDate;
        propertyEntity.ClosePrice = property.ClosePrice;
        propertyEntity.OffMarketDate = property.OffMarketDate;
        propertyEntity.OffMarketTimestamp = property.OffMarketTimestamp;
        propertyEntity.LaborInformation = property.LaborInformation;
        propertyEntity.Fencing = property.Fencing;
        propertyEntity.UnitTypeType = property.UnitTypeType;
        propertyEntity.ShowingContactType = property.ShowingContactType;
        propertyEntity.BuilderName = property.BuilderName;
        propertyEntity.ElectricOnPropertyYN = property.ElectricOnPropertyYN;
        propertyEntity.WaterfrontFeatures = property.WaterfrontFeatures;
        propertyEntity.WaterfrontYN = property.WaterfrontYN;
        propertyEntity.HomeWarrantyYN = property.HomeWarrantyYN;
        propertyEntity.FoundationDetails = property.FoundationDetails;
        propertyEntity.OpenParkingYN = property.OpenParkingYN;
        propertyEntity.Electric = property.Electric;
        propertyEntity.GreenIndoorAirQuality = property.GreenIndoorAirQuality;
        propertyEntity.DoorFeatures = property.DoorFeatures;
        propertyEntity.GreenBuildingVerificationType = property.GreenBuildingVerificationType;
        propertyEntity.ShowingContactPhoneExt = property.ShowingContactPhoneExt;
        propertyEntity.ZoningDescription = property.ZoningDescription;
        propertyEntity.BathroomsFull = property.BathroomsFull;
        propertyEntity.BathroomsTotalInteger = property.BathroomsTotalInteger;
        propertyEntity.BedroomsTotal = property.BedroomsTotal;
        propertyEntity.BuildingAreaTotal = property.BuildingAreaTotal;
        propertyEntity.LotSizeArea = property.LotSizeArea;
        propertyEntity.PhotosCount = property.PhotosCount;
        propertyEntity.RoomsTotal = property.RoomsTotal;
        propertyEntity.StoriesTotal = property.StoriesTotal;
        propertyEntity.YearBuilt = property.YearBuilt;

        if (property.City) propertyEntity.City = property.City.split(/(?=[A-Z])/).join(' ');
        if (property.BuildingName) {
            propertyEntity.BuildingKey = crypto.createHash("sha256").update(property.BuildingName.toLowerCase()).digest("hex");
        } else {
            propertyEntity.BuildingKey = crypto.createHash("sha256").update(`${property.StreetNumber} ${property.StreetName}`.toLowerCase()).digest("hex");
        }
        propertyEntity.AddressWithUnit = `${property.UnparsedAddress} ${property.UnparsedAddress.indexOf(property.UnitNumber) > -1 ? '' : property.UnitNumber}`;
        if (property.Media) {
            property.MediaURL = [];
            property.FloorPlanMediaURL = [];
            property.Media.forEach((media: any) => {
                if (media.MediaCategory === 'FloorPlan') {
                    property.FloorPlanMediaURL.push(media.MediaURL)
                } else if (media.MediaCategory === 'Photo') {
                    property.MediaURL.push(media.MediaURL);
                }
            })
            propertyEntity.FloorPlanMediaURL = property.FloorPlanMediaURL;
            propertyEntity.MediaURL = property.MediaURL
        }

        Object.keys(propertyEntity).forEach((key) => {
            if (!propertyEntity[key]) delete propertyEntity[key];
        });

        return propertyEntity;
    }
}
