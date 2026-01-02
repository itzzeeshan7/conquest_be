import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Users } from '../entities/Users.entity';
import { UserDto } from '../dto/User.dto';
import { UserRepository } from '../repositories/users.repository';
import { UserRolesService } from './userRoles.service';
import { RedisServiceAdapter } from '../../../shared/redis-adapter/redis-adapter.service';
import { v4 as uuidv4 } from 'uuid';
import { MailService } from '../../../shared/mail/mail.service';
import { ActivateEmailDto } from '../dto/ActivateEmail.dto';
import { ERRORS_CONSTANTS } from '../../../shared/constants/errors.constants';
import { SuccessResponseDto } from '../../../shared/dto/SuccessResponse.dto';
import { RequestResetPasswordDto } from '../dto/RequestResetPassword.dto';
import { ResetPasswordDto } from '../dto/ResetPassword.dto';
import { ContactDto } from '../dto/Contact.dto';
import { id, tr } from 'date-fns/locale';
import { ChangePassword } from '../dto/ChangePassword.dto';
import { Not } from 'typeorm';
import { UserRole } from '../entities/UserRole.entity';
import { UserNoPasswordDto } from '../dto/UserNoPassword.dto';
import { Role } from '../types/Role.enum';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserStorageRepository } from '../repositories/userStorage.repository';

@Injectable()
export class UsersService {

  constructor(
    public userRepository: UserRepository,
    private readonly userRolesService: UserRolesService,
    private readonly redisServiceAdapter: RedisServiceAdapter,
    private readonly mailService: MailService,
    private readonly userStorageRepository: UserStorageRepository
  ) { }

  public async addNewUser(userDto: UserDto): Promise<UserDto> {
    const { email, name, password } = userDto;
    const defaultRole = await this.userRolesService.getDefaultUserRole();
    let user = new Users();
    user.email = email;
    user.name = name;
    user.roles = [defaultRole];
    user.password = password;
    user = await this.userRepository.addNewUser(user);
    // generate uniq activation id
    const randUUid = uuidv4();
    try {
      // set uniq id to redis temporary
      await this.redisServiceAdapter.set(randUUid, user.id.toString(), 'EX', 60 * 60 * 24);
    } catch (e) {
      throw new InternalServerErrorException();
    }

    await this.mailService.sendActivationEmail(randUUid, user.email);

    return user;
  }

  public async validateContactUs(user: Users) {
    const randUUid = uuidv4();
    try {
      let id;
      if (typeof user === 'object' && user !== null) {
        id = user.id.toString();
      } else {
        id = Math.random().toString()
      }
      // set uniq id to redis temporary
      await this.redisServiceAdapter.set(randUUid, id, 'EX', 60 * 60);
    } catch (e) {
      throw new InternalServerErrorException();
    }

    return { randUUid }
  }

  public async create(userDto: UserDto): Promise<Users> {

    const { email, name, password } = userDto;
    let user = new Users();
    user.email = email;
    user.name = name;
    user.roles = userDto.roles;
    user.password = password;
    user.emailActivated = true;
    const userAdded = await this.userRepository.addNewUser(user);

    return userAdded;
  }

  public async activeUserEmail(
    activateEmailDto: ActivateEmailDto
  ): Promise<SuccessResponseDto> {
    const { code } = activateEmailDto;
    const idStr = await this.redisServiceAdapter.get(code);
    const id = parseInt(idStr, 10);
    const user = await this.userRepository.findOne({ where: { id } });
    if (user) {
      await this.redisServiceAdapter.delete(code);
      const response = new SuccessResponseDto();
      response.message = true;
      user.emailActivated = true
      await user.save();
      return response;
    } else {
      throw new BadRequestException(
        [ERRORS_CONSTANTS.CODES.INVALID_CODE_ACTIVATION]
      );
    }
  }

  public async updateUserInfo(userDto: UserDto): Promise<Users> {
    const { email, password } = userDto;
    const user = await this.userRepository.findOne({ where: { email } });
    const isValidPass = await user.validatePassword(password);

    if (isValidPass) {
      user.name = userDto.name;
      user.phone = userDto.phone;

      await user.save();
    } else {
      throw new BadRequestException(
        [ERRORS_CONSTANTS.CODES.INVALID_CREDENTIALS]
      )
    }


    return user;
  }

  public async changePassword(changePassword: ChangePassword, userDto: UserDto): Promise<Users> {
    const { email } = userDto;
    const user = await this.userRepository.findOne({ where: { email } });
    const isValidPass = await user.validatePassword(changePassword.oldPassword);

    if (isValidPass) {
      user.password = await this.userRepository.hashUserPass(changePassword.newPassword);;

      await user.save();
    } else {
      throw new BadRequestException(
        [ERRORS_CONSTANTS.CODES.INVALID_CREDENTIALS]
      )
    }

    return user;
  }

  public async requestResetPassword(
    requestResetPassword: RequestResetPasswordDto
  ): Promise<SuccessResponseDto> {
    const { email } = requestResetPassword;
    const user = await this.getByEmail(email);

    const successResponse = new SuccessResponseDto();
    successResponse.message = true;
    if (user) {
      const operationId = uuidv4();
      await this.redisServiceAdapter.set(operationId, user.id.toString(), 'EX', 60 * 60 * 24);
      await this.mailService.resetPasswordEmail(operationId, user.email);
    } else {
      throw new BadRequestException(
        [ERRORS_CONSTANTS.CODES.USER_NOT_FOUND]
      );
    }

    return successResponse;
  }
  /*
   * TODO: Check pass and password confirm in DTO
   */
  public async resetPassword(
    resetPasswordDto: ResetPasswordDto
  ): Promise<SuccessResponseDto> {
    const { code, password } = resetPasswordDto;
    const idStr = await this.redisServiceAdapter.get(code);

    if (idStr) {
      await this.redisServiceAdapter.delete(code);
      const id = parseInt(idStr, 10);
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        throw new BadRequestException([ERRORS_CONSTANTS.CODES.USER_NOT_FOUND]);
      }

      user.password = await this.userRepository.hashUserPass(password);
      user.invalidLogin = 0;
      user.invalidLoginTimestamp = null;
      await user.save();
      return new SuccessResponseDto({ message: true });
    } else {
      throw new BadRequestException();
    }
  }

  public async getByEmail(email: string): Promise<Users> {
    return this.userRepository.findOne({ where: { email } });
  }

  public async contactUs(
    contactMessage: ContactDto, user: Users, agents: Users[]
  ): Promise<SuccessResponseDto> {
    const { code } = contactMessage;
    const id = await this.redisServiceAdapter.get(code);

    if (id) {
      await this.redisServiceAdapter.delete(code);
      await this.mailService.contactAgent(contactMessage, agents);
      return new SuccessResponseDto({ message: true });
    } else {
      throw new BadRequestException(
        [ERRORS_CONSTANTS.CONTACT_US.CANNOT_SENT_MESSAGE]
      );
    }
  }

  public async contactAgent(
    contactMessage: ContactDto,
    user: Users, agents: Users[]
  ): Promise<SuccessResponseDto> {
    const { code } = contactMessage;
    const id = await this.redisServiceAdapter.get(code);

    if (id) {
      await this.redisServiceAdapter.delete(code);
      await this.mailService.contactAgent(contactMessage, agents);
      return new SuccessResponseDto({ message: true });
    } else {
      throw new BadRequestException(
        [ERRORS_CONSTANTS.CONTACT_US.CANNOT_SENT_MESSAGE]
      );
    }

  }

  public async getAllUsersAsAdmin(user: Users): Promise<Users[]> {
    return await this.userRepository.find({ where: { id: Not(user.id) } });
  }

  public async getAllRolesAsAdmin(): Promise<UserRole[]> {
    return await this.userRolesService.getAll();
  }

  public async getOneAsAdmin(email: string): Promise<Users> {
    const userEntity = await this.userRepository.findOne({ where: { email } });

    if (!userEntity) {
      throw new BadRequestException([ERRORS_CONSTANTS.CODES.USER_NOT_FOUND]);
    }

    return userEntity
  }

  public async updateUserAsAdmin(user: UserNoPasswordDto): Promise<Users> {
    const { email } = user;
    const userEntity = await this.userRepository.findOne({ where: { email } });

    if (!userEntity) {
      throw new BadRequestException([ERRORS_CONSTANTS.CODES.USER_NOT_FOUND]);
    }

    userEntity.name = user.name;
    userEntity.roles = user.roles;
    userEntity.phone = user.phone;

    return await userEntity.save();
  }

  public async createUserAsAdmin(user: Users): Promise<Users> {

    const userEntity = new Users();

    userEntity.email = user.email;
    userEntity.emailActivated = true;
    userEntity.password = await this.userRepository.hashUserPass(user.password);;
    userEntity.name = user.name;
    userEntity.roles = user.roles;
    userEntity.phone = user.phone;

    return await userEntity.save();
  }

  public async deleteUserAsAdmin(user: UserNoPasswordDto, admin: Users): Promise<SuccessResponseDto> {
    const { email } = user;
    const userEntity = await this.userRepository.findOne({ where: { email } });

    if (!userEntity) {
      throw new BadRequestException([ERRORS_CONSTANTS.CODES.USER_NOT_FOUND]);
    }

    if (userEntity.id === admin.id) {
      throw new BadRequestException([ERRORS_CONSTANTS.CODES.USER_NOT_FOUND]);
    }

    const userStorages = await this.userStorageRepository.find({ where: { user: userEntity } });
    
    for (let i = 0; i < userStorages.length; i++) {
      await userStorages[i].remove();
    };
    
    await userEntity.remove();
    return new SuccessResponseDto({ message: true });
  }

  public async getAllUsersByRole(role: Role): Promise<Users[]> {
    const userRole = await this.userRolesService.getUserRole(role);
    const users = await this.userRepository.createQueryBuilder('u').select(['u.*']).innerJoin('users_roles', 'ur', `u.id = ur.usersId`)
      .where(`ur.userRoleId = :roleId`, { roleId: userRole.id })
      .execute();
    return users;
  }

  @Cron(CronExpression.EVERY_2_HOURS)
  public async unlockUsers() {
    const lockedUsers = await this.userRepository.getLockedUsers();


    for (let i = 0; i < lockedUsers.length; i++) {
      var hours = Math.abs((new Date()).getTime() - (new Date(lockedUsers[i].invalidLoginTimestamp)).getTime()) / 36e5;

      if (hours > 2) {
        let user = new Users();

        user.id = lockedUsers[i].id;
        user.invalidLogin = 0;

        await user.save();
      }
    }
  }
}
