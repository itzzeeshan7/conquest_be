import { In, Repository, DataSource } from 'typeorm';

import { BadRequestException, Injectable } from '@nestjs/common';
import { ERRORS_CONSTANTS } from '../../../shared/constants/errors.constants';
import { UserStorage } from '../entities/UserStorage.entity';
import { Users } from '../entities/Users.entity';

@Injectable()
export class UserStorageRepository {
  private repository: Repository<UserStorage>;

  constructor(private dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(UserStorage);
  }

  // Expose base repository methods
  async findOne(options: any): Promise<UserStorage | null> {
    return this.repository.findOne(options);
  }

  async find(options?: any): Promise<UserStorage[]> {
    return this.repository.find(options);
  }

  async save(entity: UserStorage): Promise<UserStorage> {
    return this.repository.save(entity);
  }

  async remove(entity: UserStorage): Promise<UserStorage> {
    return this.repository.remove(entity);
  }

  async update(criteria: any, partialEntity: any) {
    return this.repository.update(criteria, partialEntity);
  }

  createQueryBuilder(alias?: string) {
    return this.repository.createQueryBuilder(alias);
  }

  async query(query: string, parameters?: any[]): Promise<any> {
    return this.repository.query(query, parameters);
  }

  // Custom methods
  public async addInStorage(storage: UserStorage): Promise<UserStorage> {
    try {
      return await this.repository.save(storage);
    } catch (e) {
      throw new BadRequestException([ERRORS_CONSTANTS.DB[e.code]('UserStorage')]);
    }
  }

  public async deleteStorage(storage: UserStorage): Promise<UserStorage> {
    try {
      return await this.repository.remove(storage);
    } catch (e) {
      throw new BadRequestException([ERRORS_CONSTANTS.DB[e.code]('UserStorage')]);
    }
  }

  public async getAll(user: Users): Promise<UserStorage[]> {
    try {
      return await this.repository.find({ where: { user: user } });
    } catch (e) {
      throw new BadRequestException([ERRORS_CONSTANTS.DB[e.code]('UserStorage')]);
    }
  }

  public async bulkUpdateSendNotification(ids: Array<number>, send: boolean) {
    let updateFields = { sendNotification: send } as any
    if (send) {
      updateFields.listingUpdatedDate = new Date();
    } else {
      updateFields.notificationSentDate = new Date();
    }

    try {
      this.repository.update({
        id: In(ids)
      }, updateFields)
    } catch (e) {
      throw new Error(e);
    }
  }
}
