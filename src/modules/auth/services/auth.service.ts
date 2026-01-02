import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from "../../users/services/users.service";
import { AuthSuccessDto } from "../dto/authSuccess.dto";
import { AuthDto } from "../dto/auth.dto";
import { Users } from "../../users/entities/Users.entity";
import { IJwtPayload } from "../types/jwtPayload.interface";
import { JwtService } from "@nestjs/jwt";
import { ERRORS_CONSTANTS } from "../../../shared/constants/errors.constants";

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService
    ) {
    }


    public async validateUser(authDto: AuthDto): Promise<AuthSuccessDto> {
        const { email, password } = authDto;
        const user = await this.usersService.getByEmail(email);

        // IF user not found in DB
        if (!user) {
            throw new BadRequestException([ERRORS_CONSTANTS.CODES.INVALID_CREDENTIALS]);
        }

        if (user.invalidLogin > 5) {
            throw new BadRequestException([ERRORS_CONSTANTS.CODES.USER_LOCKED]);
        }

        const isValidPass = await user.validatePassword(password);
        if (!isValidPass) {
            user.invalidLogin++;
            user.invalidLoginTimestamp = new Date();
            await user.save();
            throw new BadRequestException([ERRORS_CONSTANTS.CODES.INVALID_CREDENTIALS]);
        }

        if (!user.emailActivated) {
            throw new BadRequestException([ERRORS_CONSTANTS.CODES.USER_NOT_ACTIVATED]);
        }

        const result = new AuthSuccessDto();
        result.token = this.getUserToken(user);
        return result;
    }

    private getUserToken(user: Users): string {
        const payload: IJwtPayload = {
            email: user.email,
            id: user.id
        };

        return this.jwtService.sign(payload);
    }

}
