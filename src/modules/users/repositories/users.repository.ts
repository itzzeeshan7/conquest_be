import { MoreThan, Repository, DataSource } from "typeorm";
import { Users } from "../entities/Users.entity";
import { BadRequestException, InternalServerErrorException, Injectable } from "@nestjs/common";
import { ERRORS_CONSTANTS } from "../../../shared/constants/errors.constants";
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserRepository {
    private repository: Repository<Users>;

    constructor(private dataSource: DataSource) {
        this.repository = this.dataSource.getRepository(Users);
    }

    // Expose base repository methods
    async findOne(options: any): Promise<Users | null> {
        return this.repository.findOne(options);
    }

    async findOneOrFail(options: any): Promise<Users> {
        return this.repository.findOneOrFail(options);
    }

    async find(options?: any): Promise<Users[]> {
        return this.repository.find(options);
    }

    async save(entity: Users): Promise<Users> {
        return this.repository.save(entity);
    }

    async remove(entity: Users): Promise<Users> {
        return this.repository.remove(entity);
    }

    createQueryBuilder(alias?: string) {
        return this.repository.createQueryBuilder(alias);
    }

    async query(query: string, parameters?: any[]): Promise<any> {
        return this.repository.query(query, parameters);
    }

    async update(criteria: any, partialEntity: any): Promise<any> {
        return this.repository.update(criteria, partialEntity);
    }

    // Custom methods
    public async addNewUser(user: Users): Promise<Users> {
        try {
            user.password = await this.hashUserPass(user.password);
            return await this.repository.save(user);
        } catch (e) {
            throw new BadRequestException([ERRORS_CONSTANTS.DB[e.code]('User')])
        }
    }

    public async activateUserEmail(id: number): Promise<boolean> {
        const user = await this.repository.findOneOrFail({ where: { id } });
        if (!user) {
            return false;
        }

        user.emailActivated = true;

        try {
            await this.repository.save(user);
            if (user.emailActivated) {
                return true;
            }
        } catch (e) {
            throw new InternalServerErrorException();
        }
    }

    public async hashUserPass(password: string): Promise<string> {
        return bcrypt.hash(password, 10);
    }

    public async getLockedUsers(): Promise<Users[]> {
        const users = await this.repository.find({
            where: {
                invalidLogin: MoreThan(5)
            }
        })
        return users;
    }
}

