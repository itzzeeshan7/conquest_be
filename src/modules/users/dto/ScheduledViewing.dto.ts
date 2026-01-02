import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class ScheduledViewingDto {
    @ApiProperty({
        type: Date,
        required: true
    })
    @IsNotEmpty()
    scheduledDate: Date;

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
    @IsString()
    listing_key: string;

    @ApiProperty({
        required: false
    })
    @IsOptional()
    @IsString()
    building_key: string;

    @ApiProperty({
        required: true
    })
    @IsString()
    @IsNotEmpty()
    message: string;

    @IsNotEmpty()
    @IsUUID('4')
    code: string;

}