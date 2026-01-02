import {IsEmail, IsNotEmpty, MaxLength, MinLength} from "class-validator";
import {VALIDATION_CONSTANTS} from "../../../shared/constants/validation.constants";
import {ApiProperty} from "@nestjs/swagger";

export class AuthDto {
    @ApiProperty({
        required: true,
        type: String
    })
    @IsNotEmpty()
    @IsEmail()
    public email: string;

    @ApiProperty({
        required: true,
        type: String,
        minLength: VALIDATION_CONSTANTS.MIN_USER_PASSWORD_LENGTH,
        maxLength: VALIDATION_CONSTANTS.MAX_USER_PASSWORD_LENGTH
    })
    @IsNotEmpty()
    @MinLength(VALIDATION_CONSTANTS.MIN_USER_PASSWORD_LENGTH)
    @MaxLength(VALIDATION_CONSTANTS.MAX_USER_PASSWORD_LENGTH)
    public password: string;
}