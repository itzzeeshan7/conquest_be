import {Repository, DataSource} from "typeorm";
import { OpenHouseEntity } from "../entities/OpenHouse.entity";
import {Injectable} from "@nestjs/common";

@Injectable()
export class OpenHouseRepository {
    private repository: Repository<OpenHouseEntity>;

    constructor(private dataSource: DataSource) {
        this.repository = this.dataSource.getRepository(OpenHouseEntity);
    }

    // Expose common repository methods
    async findOne(options: any): Promise<OpenHouseEntity | null> {
        return this.repository.findOne(options);
    }

    async find(options?: any): Promise<OpenHouseEntity[]> {
        return this.repository.find(options);
    }

    async save(entity: OpenHouseEntity | OpenHouseEntity[]): Promise<any> {
        return this.repository.save(entity as any);
    }

    async remove(entity: OpenHouseEntity): Promise<OpenHouseEntity> {
        return this.repository.remove(entity);
    }

    async count(options?: any): Promise<number> {
        return this.repository.count(options);
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
}
