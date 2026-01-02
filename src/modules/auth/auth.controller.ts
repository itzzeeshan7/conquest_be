import {Body, Controller, Get, Post} from '@nestjs/common';
import {AuthService} from "./services/auth.service";
import {AuthSuccessDto} from "./dto/authSuccess.dto";
import {AuthDto} from "./dto/auth.dto";
import {ApiDefaultResponse, ApiTags} from "@nestjs/swagger";
import {UserDto} from "../users/dto/User.dto";

@ApiTags('Auth')
@Controller('auth')
export class AuthController {

    constructor(
        private readonly authService: AuthService
    ) {}

    @Post()
    @ApiDefaultResponse({
        description: 'User login.',
        type: AuthSuccessDto
    })
    public login(
        @Body() authDto: AuthDto
    ): Promise<AuthSuccessDto> {
        return this.authService.validateUser(authDto);
    }
}
