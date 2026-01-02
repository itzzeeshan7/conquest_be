import {Repository, DataSource} from "typeorm";
import {UserRole} from "../entities/UserRole.entity";
import {BadRequestException, Injectable} from "@nestjs/common";
import {ERRORS_CONSTANTS} from "../../../shared/constants/errors.constants";

@Injectable()
export class UserRoleRepository {
    private repository: Repository<UserRole>;

    constructor(private dataSource: DataSource) {
        this.repository = this.dataSource.getRepository(UserRole);
    }

    // Expose base repository methods
    async findOne(options: any): Promise<UserRole | null> {
        return this.repository.findOne(options);
    }

    async find(options?: any): Promise<UserRole[]> {
        return this.repository.find(options);
    }

    async save(entity: UserRole): Promise<UserRole> {
        return this.repository.save(entity);
    }

    async remove(entity: UserRole): Promise<UserRole> {
        return this.repository.remove(entity);
    }

    // Custom methods
    public async addRole(role: UserRole): Promise<UserRole> {
        try {
            return await this.repository.save(role);
        } catch (e) {
            throw new BadRequestException([ERRORS_CONSTANTS.DB[e.code]('Role')]);
        }
    }
}