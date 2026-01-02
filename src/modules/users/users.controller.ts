import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './services/users.service';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserDto } from './dto/User.dto';
import { Users } from './entities/Users.entity';
import { GetUser } from '../auth/get-user.decorator';
import { AuthGuard } from '@nestjs/passport';
import { ActivateEmailDto } from './dto/ActivateEmail.dto';
import { SuccessResponseDto } from '../../shared/dto/SuccessResponse.dto';
import { RequestResetPasswordDto } from './dto/RequestResetPassword.dto';
import { ResetPasswordDto } from './dto/ResetPassword.dto';
import { UserStorageService } from './services/userStorage.service';
import { UserStorageDto } from './dto/UserStorage.dto';
import { AllowAny } from '../auth/allow-any.decorator';
import { ContactDto } from './dto/Contact.dto';
import { Roles } from '../auth/roles.decorator';
import { Role } from './types/Role.enum';
import { ChangePassword } from './dto/ChangePassword.dto';
import { UserNoPasswordDto } from './dto/UserNoPassword.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ScheduledViewingDto } from './dto/ScheduledViewing.dto';
import { ScheduledViewingService } from './services/scheduledViewing.service';
import { UserRole } from './entities/UserRole.entity';
import { CancelScheduledViewingDto } from './dto/CancelScheduledViewing.dto';

@ApiTags('User')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly userStorageService: UserStorageService,
    private readonly scheduledViewingService: ScheduledViewingService
  ) { }

  @Post("/register")
  @ApiCreatedResponse({
    status: 201,
    description: 'User created.',
    type: UserDto,
  })
  public register(@Body() userDto: UserDto): Promise<UserDto> {
    return this.usersService.addNewUser(userDto);
  }

  @Post('/activate/email')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiResponse({ status: 200, description: 'User email is activated' })
  public activateEmail(
    @Body() activateEmailDto: ActivateEmailDto,
  ): Promise<SuccessResponseDto> {
    return this.usersService.activeUserEmail(activateEmailDto);
  }

  @Post('/request-reset-password')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiResponse({ status: 200, description: 'Reset link send on user mail' })
  public requestResetPassword(
    @Body() requestResetPasswordDto: RequestResetPasswordDto
  ): Promise<SuccessResponseDto> {
    return this.usersService.requestResetPassword(requestResetPasswordDto);
  }

  @Post('/reset-password')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiResponse({ status: 200, description: 'Password reset.' })
  public resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto
  ): Promise<SuccessResponseDto> {
    return this.usersService.resetPassword(resetPasswordDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/me')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiBearerAuth()
  public me(@GetUser() user: Users) {
    return user;
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/update-info')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiBearerAuth()
  public async updateInfo(@Body() user: UserDto): Promise<UserDto> {
    return await this.usersService.updateUserInfo(user);
  }

  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiBearerAuth()
  @Post('/password')
  public async changePassword(@Body() changePassword: ChangePassword, @GetUser() user: Users): Promise<UserDto> {
    return await this.usersService.changePassword(changePassword, user);
  }

  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiBearerAuth()
  @Get('/get-saved-data')
  public async getSavedData(@GetUser() user: Users): Promise<any> {
    return await this.userStorageService.getAllByUser(user);
  }

  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiBearerAuth()
  @Delete('/delete-saved-data')
  @UseInterceptors(ClassSerializerInterceptor)
  public async deleteListing(@Query() query: object): Promise<object> {
    return await this.userStorageService.deleteOne(query['id']);
  }

  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiBearerAuth()
  @Post('/save-delete-apartment')
  public async saveDeleteApartament(
    @GetUser() user: Users,
    @Body() storage: UserStorageDto
  ): Promise<UserStorageDto> {
    return await this.userStorageService.addRemoveApartmentFromStorage(
      storage,
      user
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/save-delete-building')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiBearerAuth()
  public async saveDeleteBuilding(
    @GetUser() user: Users,
    @Body() storage: UserStorageDto
  ): Promise<UserStorageDto> {
    return await this.userStorageService.addRemoveBuildingFromStorage(storage, user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/contact-us')
  @AllowAny()
  public async contactUs(@GetUser() user: Users, @Body() messageInfo: ContactDto): Promise<SuccessResponseDto> {
    const agents = await this.usersService.getAllUsersByRole(Role.AGENT);
    return await this.usersService.contactUs(messageInfo, user, agents);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/contact-agent')
  @AllowAny()
  public async contactAgent(@GetUser() user: Users, @Body() messageInfo: ContactDto): Promise<SuccessResponseDto> {
    const agents = await this.usersService.getAllUsersByRole(Role.AGENT);
    return await this.usersService.contactAgent(messageInfo, user, agents);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/validate-contact-us')
  @AllowAny()
  public async notRobot(@GetUser() user: Users) {
    return await this.usersService.validateContactUs(user)
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.ADMIN)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('/get-all')
  public async getAllUsers(@GetUser() user: Users): Promise<Users[]> {
    return await this.usersService.getAllUsersAsAdmin(user);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.ADMIN)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('/get-all-roles')
  public async getAllRolesAsAdmin(): Promise<UserRole[]> {
    return await this.usersService.getAllRolesAsAdmin();
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.ADMIN)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('/get-by-email')
  public async getOne(@Query() email: string): Promise<Users> {
    return await this.usersService.getOneAsAdmin(email);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.ADMIN)
  @Patch('/update')
  @UseInterceptors(ClassSerializerInterceptor)
  public async update(@Body() user: UserNoPasswordDto): Promise<Users> {
    return await this.usersService.updateUserAsAdmin(user);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.ADMIN)
  @Post('/create')
  public async create(@Body() user: Users): Promise<Users> {
    return await this.usersService.createUserAsAdmin(user);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.ADMIN)
  @Post('/delete')
  public async delete(@Body() user: UserNoPasswordDto, @GetUser() admin: Users): Promise<SuccessResponseDto> {
    return await this.usersService.deleteUserAsAdmin(user, admin);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('/schedule-view')
  @UseInterceptors(ClassSerializerInterceptor)
  public async scheduleView(@GetUser() user: Users, @Body() scheduleView: ScheduledViewingDto): Promise<SuccessResponseDto> {
    const agents = await this.usersService.getAllUsersByRole(Role.AGENT);
    return await this.scheduledViewingService.sendAndSaveScheduledViewing(user, scheduleView, agents);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('/cancel-schedule-view')
  @UseInterceptors(ClassSerializerInterceptor)
  public async cancelScheduleView(@GetUser() user: Users, @Body() cancelScheduleView: CancelScheduledViewingDto): Promise<SuccessResponseDto> {
    const agents = await this.usersService.getAllUsersByRole(Role.AGENT);
    return await this.scheduledViewingService.cancelScheduledViewing(user, cancelScheduleView, agents);
  }
}
