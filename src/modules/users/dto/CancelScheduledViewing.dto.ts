
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class CancelScheduledViewingDto {
    // @ApiProperty({
    //     required: false
    // })
    // @IsOptional()
    // apartmentId: number;

    // @ApiProperty({
    //     required: false
    // })
    // @IsOptional()
    // buildingId: number;

    @ApiProperty({
        required: false
    })
    @IsOptional()
    listing_key: number;

    @ApiProperty({
        required: false
    })
    @IsOptional()
    building_key: number;

    @IsNotEmpty()
    @IsUUID('4')
    code: string;
}