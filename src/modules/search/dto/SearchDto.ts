import {IsNotEmpty} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class SearchDto {
    @ApiProperty({
        required: true,
        type: String
    })
    @IsNotEmpty()
    public query: string;
}
