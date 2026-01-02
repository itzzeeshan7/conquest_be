import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, ValidateIf } from 'class-validator';

export class UserStorageDto {
  // @IsNumber()
  // @IsOptional()
  // apartamentId?: number;

  @IsString()
  @ApiProperty()
  @IsOptional()
  @ValidateIf(o => o.listing_key === undefined)
  building_key?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  @ValidateIf(o => o.building_key === undefined)
  listing_key?: string;
}
