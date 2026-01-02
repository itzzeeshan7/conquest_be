import {ApiProperty} from "@nestjs/swagger";
import {IsNotEmpty, IsUUID} from "class-validator";

export class ActivateEmailDto {
    @ApiProperty({
        type: String,
        required: true
    })
    @IsNotEmpty()
    @IsUUID('4')
    code: string;
}