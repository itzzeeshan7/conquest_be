import {ApiProperty} from "@nestjs/swagger";
import {IsEmail, IsNotEmpty} from "class-validator";

export class RequestResetPasswordDto {
    @ApiProperty({
        required: true
    })
    @IsNotEmpty()
    @IsEmail()
    public email: string;
}