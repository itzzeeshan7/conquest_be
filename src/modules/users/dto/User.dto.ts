import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, Matches, MaxLength, MinLength } from "class-validator";
import { VALIDATION_CONSTANTS } from "../../../shared/constants/validation.constants";
import { UserRole } from "../entities/UserRole.entity";
import { UserRoleDto } from "./UserRole.dto";

const passwordRegEx =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$%^&+=!])(?!.*\s).{8,100}$/;

export class UserDto {
    @ApiProperty()
    @IsNotEmpty()
    public name: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsEmail()
    public email: string;

    @ApiProperty()
    @IsOptional()
    @IsPhoneNumber('US', { message: 'Phone number must be valid' })
    public phone?: string;

    @ApiProperty({
        minLength: VALIDATION_CONSTANTS.MIN_USER_PASSWORD_LENGTH,
        maxLength: VALIDATION_CONSTANTS.MAX_USER_PASSWORD_LENGTH
    })
    @IsNotEmpty()
    @MinLength(VALIDATION_CONSTANTS.MIN_USER_PASSWORD_LENGTH)
    @MaxLength(VALIDATION_CONSTANTS.MAX_USER_PASSWORD_LENGTH)
    @Matches(passwordRegEx, {
    message: `Password must contain Minimum 8 and maximum 20 characters, 
      at least one uppercase letter, 
      one lowercase letter, 
      one number and 
      one special character`,
    })
    public password: string;

    @ApiProperty({
        type: UserRoleDto,
        isArray: true
    })
    @IsOptional()
    public roles?: UserRole[];
}
