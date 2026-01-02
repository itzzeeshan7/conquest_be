import { BadRequestException, Injectable } from "@nestjs/common";
import { Repository, DataSource } from "typeorm";
import { ERRORS_CONSTANTS } from "../../../shared/constants/errors.constants";
import { ScheduledViewing } from "../entities/ScheduledViewing.entity";

@Injectable()
export class ScheduledViewingRepository {
    private repository: Repository<ScheduledViewing>;

    constructor(private dataSource: DataSource) {
        this.repository = this.dataSource.getRepository(ScheduledViewing);
    }

    // Expose base repository methods
    async findOne(options: any): Promise<ScheduledViewing | null> {
        return this.repository.findOne(options);
    }

    async find(options?: any): Promise<ScheduledViewing[]> {
        return this.repository.find(options);
    }

    async save(entity: ScheduledViewing): Promise<ScheduledViewing> {
        return this.repository.save(entity);
    }

    async remove(entity: ScheduledViewing): Promise<ScheduledViewing> {
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
    public async createUpdate(scheduledViewing: ScheduledViewing): Promise<ScheduledViewing> {
        try {
            return await this.repository.save(scheduledViewing);
        } catch (e) {
            throw new BadRequestException([ERRORS_CONSTANTS.DB[e.code]('ScheduledViewing')]);
        }
    }
}