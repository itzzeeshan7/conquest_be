import {IsNotEmpty, IsUUID, MaxLength, MinLength} from "class-validator";
import {VALIDATION_CONSTANTS} from "../../../shared/constants/validation.constants";
import {ApiProperty} from "@nestjs/swagger";

export class ResetPasswordDto {
    @ApiProperty({
        required: true,
    })
    @IsNotEmpty()
    @IsUUID('4')
    public code: string;

    @ApiProperty({
        minLength: VALIDATION_CONSTANTS.MIN_USER_PASSWORD_LENGTH,
        maxLength: VALIDATION_CONSTANTS.MAX_USER_PASSWORD_LENGTH
    })
    @IsNotEmpty()
    @MinLength(VALIDATION_CONSTANTS.MIN_USER_PASSWORD_LENGTH)
    @MaxLength(VALIDATION_CONSTANTS.MAX_USER_PASSWORD_LENGTH)
    public password: string;

    @ApiProperty({
        minLength: VALIDATION_CONSTANTS.MIN_USER_PASSWORD_LENGTH,
        maxLength: VALIDATION_CONSTANTS.MAX_USER_PASSWORD_LENGTH
    })
    @IsNotEmpty()
    @MinLength(VALIDATION_CONSTANTS.MIN_USER_PASSWORD_LENGTH)
    @MaxLength(VALIDATION_CONSTANTS.MAX_USER_PASSWORD_LENGTH)
    public passwordConfirmation: string;
}