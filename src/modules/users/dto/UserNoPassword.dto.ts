import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, MaxLength, MinLength } from "class-validator";
import { VALIDATION_CONSTANTS } from "../../../shared/constants/validation.constants";
import { UserRole } from "../entities/UserRole.entity";
import { Users } from "../entities/Users.entity";
import { UserRoleDto } from "./UserRole.dto";

export class UserNoPasswordDto {
    @ApiProperty()
    @IsNotEmpty()
    public id: number;

    @ApiProperty()
    @IsNotEmpty()
    public name: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsEmail()
    public email: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    public phone?: string;

    @ApiProperty({
        type: UserRoleDto,
        isArray: true
    })
    @IsOptional()
    public roles: UserRole[];
}
