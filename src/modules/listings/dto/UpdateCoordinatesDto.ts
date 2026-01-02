import {IsNotEmpty, ValidateNested} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";
import { Type } from "class-transformer";

export class UpdateCoordinatesDto {
    @ApiProperty({
        required: true,
        type: String
    })
    @IsNotEmpty()
    public id: string;

    @ApiProperty({
        required: true,
        type: String
    })
    @IsNotEmpty()
    public longitude: string;

    @ApiProperty({
        required: true,
        type: String
    })
    @IsNotEmpty()
    public latitude: string;
}

export class UpdateCoordinatesArrayDto {
    @Type(() => UpdateCoordinatesDto)
    @ValidateNested({ each: true })
    items: UpdateCoordinatesDto[];
}