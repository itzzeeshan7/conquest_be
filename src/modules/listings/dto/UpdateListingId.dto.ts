import { IsNumber, IsOptional } from "class-validator";

export class UpdateListingByIds {
    @IsNumber()
    @IsOptional()
    id: number;
  }