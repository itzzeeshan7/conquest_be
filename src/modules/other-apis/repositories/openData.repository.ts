import { Repository, DataSource } from "typeorm";
import { OpenData } from "../entities/OpenData.entity";
import { Injectable } from "@nestjs/common";

@Injectable()
export class OpenDataRepository {
    private repository: Repository<OpenData>;

    constructor(private dataSource: DataSource) {
        this.repository = this.dataSource.getRepository(OpenData);
    }

    // Expose common repository methods
    async findOne(options: any): Promise<OpenData | null> {
        return this.repository.findOne(options);
    }

    async find(options?: any): Promise<OpenData[]> {
        return this.repository.find(options);
    }

    async save(entity: OpenData): Promise<OpenData> {
        return this.repository.save(entity);
    }

    async remove(entity: OpenData): Promise<OpenData> {
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
}