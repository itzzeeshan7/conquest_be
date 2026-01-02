import {IsNotEmpty} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class AuthSuccessDto {
    @ApiProperty()
    @IsNotEmpty()
    public token: string;
}