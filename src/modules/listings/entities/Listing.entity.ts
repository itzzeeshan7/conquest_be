import { MainEntity } from '../../../shared/database/Base.entity';
import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

// @Entity()
// export class ListingEntity extends MainEntity {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @Column({ nullable: true })
//   Address: string;

//   @Column({ nullable: true })
//   AddressDisplay: string;

//   @Column({ nullable: true })
//   AddressWithUnit: string;

//   @Column({ nullable: true, type: 'bigint' })
//   Agent1Id: number;

//   @Column({ nullable: true, enum: EApprovalStatus })
//   ApprovalStatus: EApprovalStatus;

//   @Column({
//     type: 'date',
//     nullable: true,
//   })
//   AvailableDate: Date;

//   @Column({ nullable: true, type: 'int' })
//   BrokerageID: number;

//   @Column({ nullable: true })
//   BrokerageName: string;

//   @Column({ nullable: true })
//   BrokerageUrl: string;

//   @Column({ nullable: true })
//   BrokerageWebsite: boolean;

//   @Column({ nullable: true })
//   BuildingClass: string;

//   // Amnities
//   @Column({ nullable: true })
//   BuildingBikeStorage: boolean;

//   @Column({ nullable: true })
//   BuildingDoorman: boolean;

//   @Column({ nullable: true })
//   BuildingElevator: boolean;

//   @Column({ nullable: true })
//   BuildingGarage: boolean;

//   @Column({ nullable: true })
//   BuildingGym: boolean;

//   @Column({ nullable: true })
//   BuildingLaundry: boolean;

//   @Column({ nullable: true })
//   BuildingPets: boolean;

//   @Column({ nullable: true })
//   BuildingPool: boolean;

//   @Column({ nullable: true })
//   BuildingPrewar: boolean;

//   @Column({ nullable: true })
//   BuildingRooftop: boolean;

//   @Column({ nullable: true })
//   BuildingStorage: boolean;

//   @Column({ nullable: true, type: 'bigint' })
//   BuildingId: Number;

//   @Column({ nullable: true })
//   City: string;

//   @Column({ nullable: true, type: 'float4' })
//   CommissionAmount: number;

//   @Column({
//     enum: ECommissionType,
//     nullable: true,
//   })
//   CommissionType: ECommissionType;

//   @Column({
//     type: 'date',
//     nullable: true,
//   })
//   CreatedAt: Date;

//   @Column({ nullable: true })
//   Furnished: 'Yes' | 'No' | 'Optional';

//   @Column({ nullable: true })
//   Garden: boolean;

//   @Column({ nullable: true })
//   HasFireplace: boolean;

//   @Column({ nullable: true })
//   HasOutdoorSpace: boolean;

//   @Column({ nullable: true, type: 'float4' })
//   HoaFee: number;

//   @Column({
//     unique: true,
//     type: 'bigint'
//   })
//   PerchwellId: number;

//   @Column({ nullable: true })
//   IDXDisplay: boolean;

//   @Column({ nullable: true, array: true })
//   ImageListLarge: string;

//   @Column({ nullable: true, array: true })
//   ImageListOriginal: string;

//   @Column({ nullable: true, array: true })
//   ImageListWithoutFloorplans: string;

//   @Column({nullable: true, array: true})
//   FloorPlanList: string;

//   @Column({ nullable: true })
//   Latitude: string;

//   @Column({ nullable: true })
//   LeaseTerm: string; // “One Year”/“Two Year”/“Short-term”/“Month-to-month”/“Specific term”/“One or Two year”/“Short or Long term”

//   @Column({
//     type: 'date',
//     nullable: true,
//   })
//   ListDate: Date;

//   @Column({ nullable: true, type: 'bigint' })
//   ListingPrice: number;

//   @Column({ nullable: true, type: 'float4' })
//   ListingPricePerSqft: number;

//   @Column({ nullable: true })
//   ListingUrl: string;

//   @Column({ nullable: true })
//   Longitude: string;

//   @Column({ nullable: true })
//   MarketingDescription: string;

//   @Column({ nullable: true })
//   MarketingDescriptionTruncated: string;

//   @Column({ nullable: true })
//   Neighborhood: string;

//   @Column({ nullable: true })
//   NewDevelopment: boolean;

//   @Column({ nullable: true, type: 'float4' })
//   NumBaths: number;

//   @Column({ nullable: true, type: 'float4' })
//   NumBedrooms: number;

//   @Column({ nullable: true, type: 'float4' })
//   NumHalfBaths: number;

//   @Column({ nullable: true, type: 'float4' })
//   NumRooms: number;

//   @Column({ nullable: true, type: 'float4' })
//   NumBuildingUnits: number;

//   @Column({ nullable: true, type: 'float4' })
//   NumBuildingStories: number;

//   @Column({ nullable: true, type: 'float4' })
//   OriginalPrice: number;

//   @Column({
//     enum: EPropertyType,
//     nullable: true,
//   })
//   PropertyType: EPropertyType;

//   @Column({ nullable: true, type: 'float4' })
//   PropertyTypeCode: number;

//   @Column({ nullable: true, type: 'float4' })
//   RealEstateTax: number;

//   @Column({ nullable: true })
//   RentingAllowed: boolean;

//   @Column({ nullable: true })
//   SaleOrRental: 'S' | 'R';

//   @Column({ nullable: true })
//   Slug: string;

//   @Column({ nullable: true })
//   Sponsored: boolean;

//   @Column({ nullable: true })
//   State: string;

//   @Column({ nullable: true, type: 'int' })
//   StatusCode: number;

//   @Column({
//     type: 'date',
//     nullable: true,
//   })
//   StatusLastChanged: Date;

//   @Column({ nullable: true })
//   UnitBalcony: boolean;

//   @Column({ nullable: true })
//   UnitGarden: boolean;

//   @Column({ nullable: true })
//   UnitLaundry: boolean;

//   @Column({ nullable: true })
//   UnitNumber: string;

//   @Column({ nullable: true })
//   UnitTerrace: boolean;

//   @Column({
//     type: 'date',
//     nullable: true,
//   })
//   UpdatedAt: Date;

//   @Column({ nullable: true })
//   VOWAddressDisplay: boolean;

//   @Column({ nullable: true })
//   VOWAutomatedValuationDisplay: boolean;

//   @Column({ nullable: true })
//   VOWConsumerComment: boolean;

//   @Column({ nullable: true })
//   VOWEntireListingDisplay: boolean;

//   @Column({ nullable: true })
//   YearBuilt: string;

//   @Column({ nullable: true })
//   Zip: string;

//   @Column({ nullable: true })
//   Dishwasher: boolean;

//   @Column({ nullable: true })
//   Multilevel: boolean;

//   @Column({ nullable: true })
//   Den: boolean;

//   @Column({ nullable: true })
//   Foyer: boolean;

//   @Column({ nullable: true })
//   RebnyID: string;

//   @Column({ nullable: true })
//   Published: boolean;

//   @Column({ nullable: true })
//   PlaceName: string;
// }


// Parchwell table
@Entity()
export class ListingEntity extends MainEntity {
  @PrimaryColumn()
  id: number;

  @Column({ nullable: true })
  bbl: string;

  @Column({ nullable: true })
  den: boolean;

  @Column({ nullable: true })
  spa: boolean;

  @Index('LISTING_ENTITY_ZIP_INDEX')
  @Column({ nullable: true })
  zip: string;

  @Column({ type: 'int', nullable: true })
  beds: number;

  @Index('LISTING_ENTITY_CITY_INDEX')
  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  loft: boolean;

  @Column({ nullable: true })
  slug: string;

  @Column({ type: 'float4', nullable: true })
  sqft: number;

  @Column({ nullable: true })
  agent: string;

  @Column({ type: 'int', nullable: true })
  baths: number;

  @Column({ nullable: true })
  bonus: string;

  @Column({ type: 'float4', nullable: true })
  depth: number;

  @Column({ nullable: true })
  foyer: boolean;

  @Column({ type: 'float4', nullable: true })
  price: number;

  @Column({ nullable: true })
  state: string;

  @Column({ type: 'float4', nullable: true })
  width: number;

  @Column({ nullable: true })
  agents: boolean;

  @Column({ nullable: true })
  garden: boolean;

  @Column({ nullable: true })
  hidden: boolean;

  @Column({ nullable: true })
  locked: boolean;

  @Column({ nullable: true })
  lounge: boolean;

  @Column({ type: 'int', nullable: true })
  mls_id: number;

  @Index('LISTING_ENTITY_ADDRESS_INDEX')
  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  history: boolean;

  @Column({ type: 'float4', nullable: true })
  hoa_fee: number;

  @Column({ nullable: true })
  is_wide: boolean;

  @Column({ nullable: true })
  library: boolean;

  @Column({ type: 'float4', nullable: true })
  parties: number;

  @Column({ type: 'int', nullable: true })
  agent_id: number;

  @Column({ nullable: true })
  approval: boolean;

  @Column({ nullable: true })
  dog_care: boolean;

  @Column({ nullable: true })
  main_img: string;

  @Column({ nullable: true })
  min_term: string;

  @Column({ nullable: true })
  playroom: boolean;

  @Column({ nullable: true })
  rebny_id: string;

  @Column({ type: 'int', nullable: true })
  agent1_id: number;

  @Column({ type: 'int', nullable: true })
  agent2_id: number;

  @Column({ type: 'int', nullable: true })
  agent3_id: number;

  @Column({ type: 'int', nullable: true })
  agent4_id: number;

  @Column({ nullable: true })
  concierge: boolean;

  @Column({ nullable: true })
  courtyard: boolean;

  @Column({ nullable: true })
  free_rent: string;

  @Column({ nullable: true })
  furnished: string;

  @Column({ type: 'float4', nullable: true })
  hoa_fee_s: number;

  @Column({
    type: 'date',
    nullable: true,
  })
  list_date: Date;

  @Column({ type: 'int', nullable: true })
  list_days: number;

  @Column({ type: 'float4', nullable: true })
  lot_depth: number;

  @Column({ type: 'float4', nullable: true })
  lot_width: number;

  @Column({ type: 'float4', nullable: true })
  num_baths: number;

  @Column({ type: 'float4', nullable: true })
  num_rooms: number;

  @Column({ type: 'float4', nullable: true })
  num_units: number;

  @Column({ type: 'int', nullable: true })
  office_id: number;

  @Column({ nullable: true })
  park_view: boolean;

  @Column({ nullable: true })
  penthouse: boolean;

  @Column({ nullable: true })
  published: boolean;

  @Column({ type: 'int', nullable: true })
  region_id: number;

  @Column({
    type: 'date',
    nullable: true,
  })
  sale_date: Date;

  @Column({ nullable: true })
  sponsored: boolean;

  @Column({ nullable: true })
  video_url: string;

  @Column({ nullable: true })
  central_ac: boolean;

  @Column({ nullable: true })
  concession: string;

  @Column({ nullable: true, type: 'date' })
  created_at: Date;

  @Column({ nullable: true })
  dishwasher: boolean;

  @Column({ nullable: true })
  exclusions: boolean;

  @Column({ nullable: true })
  full_floor: boolean;

  @Column({ nullable: true, array: true })
  image_list: string;

  @Column({ nullable: true })
  inclusions: boolean;

  @Column({ nullable: true })
  lease_term: string;

  @Column({ nullable: true })
  lease_type: string;

  @Column({ nullable: true })
  media_room: boolean;

  @Column({ nullable: true })
  multilevel: boolean;

  @Index('LISTING_ENTITY_PLACE_NAME_INDEX')
  @Column({ nullable: true })
  place_name: string;

  @Column({ type: 'float4', nullable: true })
  sale_price: number;

  @Column({
    type: 'date',
    nullable: true,
  })
  updated_at: Date;

  @Column({ nullable: true })
  water_view: boolean;

  @Column({ type: 'float4', nullable: true })
  year_built: number;

  @Column({ nullable: true })
  agent_email: string;

  @Column({ nullable: true })
  agent_image: string;

  @Column({ nullable: true })
  agent_phone: string;

  @Index('LISTING_ENTITY_BUILDING_ID_INDEX')
  @Column({ type: 'int', nullable: true })
  building_id: number;

  @Column({ nullable: true })
  coexclusive: boolean;

  @Column({ nullable: true })
  dining_room: boolean;

  @Column({ nullable: true })
  is_landmark: boolean;

  @Column({ nullable: true })
  large_image: string;

  @Column({ type: 'float4', nullable: true })
  list_number: number;

  @Column({ type: 'text', nullable: true })
  listing_key: string;

  @Column({ nullable: true })
  listing_url: string;

  @Column({ type: 'float4', nullable: true })
  num_stories: number;

  @Column({ nullable: true })
  open_houses: boolean;

  @Column({ type: 'int', nullable: true })
  status_code: number;

  @Column({ nullable: true })
  status_text: string;

  @Column({ nullable: true })
  syndication: boolean;

  @Column({ nullable: true })
  unit_garden: boolean;

  @Column({ nullable: true })
  unit_number: string;

  @Column({ nullable: true })
  yoga_studio: boolean;

  @Column({ nullable: true })
  agent1_email: string;

  @Column({ nullable: true })
  agent1_image: string;

  @Column({ nullable: true })
  agent2_email: string;

  @Column({ nullable: true })
  agent2_image: string;

  @Column({ nullable: true })
  agent3_email: string;

  @Column({ nullable: true })
  agent3_image: string;

  @Column({ nullable: true })
  agent4_email: string;

  @Column({ nullable: true })
  agent4_image: string;

  @Column({ type: 'int', nullable: true })
  brokerage_id: number;

  @Column({ nullable: true })
  building_gym: boolean;

  @Column({ nullable: true })
  cold_storage: boolean;

  @Column({ type: 'float4', nullable: true })
  flip_tax_pct: number;

  @Column({ type: 'int', nullable: true })
  floor_number: number;

  @Column({ nullable: true })
  guest_suites: boolean;

  @Column({ type: 'text', nullable: true })
  home_offices: number;

  @Column({ nullable: true })
  medium_image: string;

  @Column({ nullable: true })
  neighborhood: string;

  @Column({ type: 'float4', nullable: true })
  num_bedrooms: number;

  @Column({ nullable: true })
  package_room: boolean;

  @Column({ nullable: true })
  pied_a_terre: boolean;

  @Column({ nullable: true })
  skyline_view: boolean;

  @Column({ nullable: true })
  unit_balcony: boolean;

  @Column({ nullable: true })
  unit_laundry: boolean;

  @Column({ nullable: true })
  unit_terrace: boolean;

  @Column({ nullable: true })
  wrap_terrace: boolean;

  @Column({ nullable: true })
  brokerage_url: string;

  @Index('LISTING_ENTITY_BUILDING_NAME_INDEX')
  @Column({ nullable: true })
  building_name: string;

  @Column({ nullable: true })
  building_pets: boolean;

  @Column({ nullable: true })
  building_pool: boolean;

  @Column({ nullable: true })
  configuration: boolean;

  @Column({
    type: 'date',
    nullable: true,
  })
  contract_date: Date;

  @Column({ nullable: true })
  display_label: string;

  @Column({ nullable: true })
  east_exposure: boolean;

  @Column({ type: 'float4', nullable: true })
  exterior_sqft: number;

  @Column({ nullable: true })
  has_fireplace: boolean;

  @Column({ nullable: true })
  is_historical: boolean;

  @Column({ type: 'float4', nullable: true })
  listing_price: number;

  @Column({ nullable: true })
  live_in_super: boolean;

  @Column({ nullable: true })
  porte_cochere: boolean;

  @Column({ nullable: true })
  property_type: string;

  @Column({ nullable: true })
  west_exposure: boolean;

  @Column({ nullable: true })
  agent_initials: string;

  @Column({
    type: 'date',
    nullable: true,
  })
  available_date: Date;

  @Column({ nullable: true })
  billiards_room: boolean;

  @Column({ nullable: true })
  board_approval: boolean;

  @Column({ nullable: true })
  brokerage_name: string;

  @Column({ nullable: true })
  building_class: string;

  @Column({ type: 'int', nullable: true })
  buyer_agent_id: number;

  @Column({ type: 'float4', nullable: true })
  contract_price: number;

  @Column({ type: 'text', nullable: true })
  deposit_amount: number;

  @Column({ nullable: true })
  eat_in_kitchen: boolean;

  @Column({ nullable: true, array: true })
  external_media: string;

  @Column({ nullable: true })
  furnished_rent: boolean;

  @Column({ nullable: true })
  galley_kitchen: boolean;

  @Column({ nullable: true })
  listing_source: string;

  @Column({ nullable: true })
  north_exposure: boolean;

  @Column({ type: 'float4', nullable: true })
  num_fireplaces: number;

  @Column({ type: 'float4', nullable: true })
  num_full_baths: number;

  @Column({ type: 'float4', nullable: true })
  num_half_baths: number;

  @Column({ type: 'float4', nullable: true })
  original_price: number;

  @Column({ nullable: true })
  pilates_studio: boolean;

  @Column({ nullable: true })
  property_usage: boolean;

  @Column({ nullable: true })
  sale_or_rental: string;

  @Column({ nullable: true })
  screening_room: boolean;

  @Column({ nullable: true })
  south_exposure: boolean;

  @Column({ nullable: true })
  address_display: string;

  @Column({ nullable: true })
  agent_last_name: string;

  @Column({ nullable: true })
  approval_status: string;

  @Column({ nullable: true })
  building_garage: boolean;

  @Column({ nullable: true })
  building_prewar: boolean;

  @Column({ nullable: true })
  buyer_office_id: number;

  @Column({ nullable: true })
  commission_type: string;

  @Column({ nullable: true })
  conference_room: boolean;

  @Column({ nullable: true })
  developer_email: string;

  @Column({ nullable: true })
  entire_building: boolean;

  @Column({
    type: 'date',
    nullable: true,
  })
  expiration_date: Date;

  @Column({ type: 'float4', nullable: true })
  flip_tax_amount: number;

  @Column({ nullable: true, array: true })
  floor_plan_list: string;

  @Column({ nullable: true })
  has_tax_benefit: boolean;

  @Column({ type: 'float4', nullable: true })
  monthly_payment: number;

  @Column({ nullable: true })
  new_development: boolean;

  @Column({ type: 'float4', nullable: true })
  real_estate_tax: number;

  @Column({ nullable: true })
  renting_allowed: boolean;

  @Column({ nullable: true })
  rls_idx_display: boolean;

  @Column({ type: 'float4', nullable: true })
  total_monthlies: number;

  @Column({ nullable: true })
  virtual_doorman: boolean;

  @Column({ nullable: true })
  agent1_last_name: string;

  @Column({ nullable: true })
  agent2_last_name: string;

  @Column({ nullable: true })
  agent3_last_name: string;

  @Column({ nullable: true })
  agent4_last_name: string;

  @Column({ nullable: true })
  agent_first_name: string;

  @Column({ nullable: true })
  building_doorman: boolean;

  @Column({ nullable: true })
  building_laundry: boolean;

  @Column({ nullable: true })
  building_rooftop: boolean;

  @Column({ nullable: true })
  building_storage: boolean;

  @Column({ type: 'int', nullable: true })
  buyers_agent1_id: number;

  @Column({ type: 'int', nullable: true })
  buyers_agent2_id: number;

  @Column({ type: 'int', nullable: true })
  buyers_agent3_id: number;

  @Column({ type: 'int', nullable: true })
  buyers_agent4_id: number;

  @Column({ nullable: true })
  catering_kitchen: boolean;

  @Column({ type: 'float4', nullable: true })
  commission_total: number;

  @Column({ nullable: true })
  floorplan_url_3d: string;

  @Column({ nullable: true, array: true })
  image_list_large: string;

  @Column({ nullable: true, array: true })
  image_list_thumb: string;

  @Column({ type: 'float4', nullable: true })
  number_of_shares: number;

  @Column({ nullable: true })
  override_expired: boolean;

  @Column({ nullable: true })
  virtual_tour_url: string;

  @Column({ nullable: true })
  windowed_kitchen: boolean;

  @Column({ nullable: true })
  address_with_unit: string;

  @Column({ nullable: true })
  agent1_first_name: string;

  @Column({ nullable: true })
  agent2_first_name: string;

  @Column({ nullable: true })
  agent3_first_name: string;

  @Column({ nullable: true })
  agent4_first_name: string;

  @Column({ nullable: true })
  automated_parking: boolean;

  @Column({ nullable: true })
  brokerage_website: string;

  @Column({ nullable: true })
  building_elevator: boolean;

  @Column({ nullable: true })
  central_park_view: boolean;

  @Column({ nullable: true })
  cobroke_agreement: string;

  @Column({ nullable: true })
  combined_latitude: string;

  @Column({ type: 'float4', nullable: true })
  commission_amount: number;

  @Column({ nullable: true })
  general_condition: string;

  @Column({ nullable: true })
  google_map_params: string;

  @Column({ nullable: true })
  has_outdoor_space: boolean;

  @Column({ type: 'text', nullable: true })
  hoa_fee_formatted: number;

  @Column({ type: 'float4', nullable: true })
  max_financing_pct: number;

  @Column({ nullable: true })
  other_listing_ids: string;

  @Column({ nullable: true })
  primary_phone_num: string;

  @Column({ nullable: true })
  short_description: string;

  @Column({ nullable: true })
  year_last_altered: boolean;

  @Column({ nullable: true })
  combined_longitude: string;

  @Column({ nullable: true })
  commission_remarks: string;

  @Column({ nullable: true })
  formal_dining_room: boolean;

  @Column({ type: 'float4', nullable: true })
  pct_tax_deductable: number;

  @Column({ type: 'float4', nullable: true })
  property_type_code: number;

  @Column({ type: 'float4', nullable: true })
  sale_listing_price: number;

  @Column({ nullable: true })
  buyers_agent1_email: string;

  @Column({ nullable: true })
  buyers_agent2_email: string;

  @Column({ nullable: true })
  buyers_agent3_email: string;

  @Column({ nullable: true })
  buyers_agent4_email: string;

  @Column({ type: 'int', nullable: true })
  buyers_brokerage_id: number;

  @Column({ type: 'float4', nullable: true })
  ceiling_height_feet: number;

  @Column({ nullable: true, array: true })
  image_list_original: string;

  @Column({ nullable: true })
  is_recently_altered: boolean;

  @Column({ nullable: true })
  property_type_label: string;

  @Column({ nullable: true, type: 'date' })
  status_last_changed: Date;

  @Column({ nullable: true })
  vow_address_display: boolean;

  @Column({ type: 'float4', nullable: true })
  above_area_square_ft: number;

  @Column({ nullable: true })
  data_for_text_search: string;

  @Column({
    type: 'date',
    nullable: true,
  })
  details_last_updated: Date;

  @Column({ nullable: true })
  flip_tax_description: boolean;

  @Column({ type: 'float4', nullable: true })
  listing_price_per_br: number;

  @Column({ nullable: true })
  recorded_closing_url: string;

  @Column({ nullable: true })
  showing_instructions: string;

  @Column({ nullable: true })
  vow_consumer_comment: boolean;

  @Column({ nullable: true })
  broker_community_only: boolean;

  @Column({ nullable: true })
  building_bike_storage: boolean;

  @Column({ type: 'float4', nullable: true })
  ceiling_height_inches: number;

  @Column({ nullable: true })
  electric_car_chargers: boolean;

  @Column({ type: 'float4', nullable: true })
  lease_term_max_months: number;

  @Column({ type: 'float4', nullable: true })
  lease_term_min_months: number;

  @Column({ type: 'float4', nullable: true })
  listing_price_rounded: number;

  @Column({ nullable: true })
  marketing_description: string;

  @Column({ nullable: true })
  broker_to_broker_notes: string;

  @Column({ type: 'float4', nullable: true })
  concession_months_free: number;

  @Column({ type: 'float4', nullable: true })
  concession_term_months: number;

  @Column({ type: 'float4', nullable: true })
  current_assessed_value: number;

  @Column({ type: 'text', nullable: true })
  developer_brokerage_id: number;

  @Column({ nullable: true })
  intersect_match_failed: boolean;

  @Column({ type: 'float4', nullable: true })
  listing_price_per_sqft: number;

  @Column({ nullable: true })
  website_display_address: string;

  @Column({ nullable: true })
  address_with_unit_hashed: string;

  @Column({ nullable: true })
  address_with_unit_number: string;

  @Column({ type: 'int', nullable: true })
  canonical_neighborhood_id: number;

  @Column({ nullable: true })
  monthly_payment_formatted: string;

  @Column({ nullable: true })
  total_monthlies_formatted: string;

  @Column({ nullable: true })
  percent_of_common_elements: string;

  @Column({ nullable: true })
  vow_entire_listing_display: boolean;

  @Column({ nullable: true })
  canonical_neighborhood_name: string;

  @Column({ nullable: true })
  website_display_neighborhood: boolean;

  @Column({ nullable: true, array: true })
  image_list_without_floorplans: string;

  @Column({ nullable: true })
  marketing_description_truncated: string;

  @Column({ nullable: true })
  vow_automated_valuation_display: boolean;

  // @Column({ nullable: true })

  // client_specific_attributes.silverstein_pricing_campaign: string;
}
