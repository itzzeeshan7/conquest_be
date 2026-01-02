import { Repository, DataSource } from "typeorm";
import { Emails } from "../entities/Emails.entity";
import { Injectable } from "@nestjs/common";

@Injectable()
export class EmailsRepository {
    private repository: Repository<Emails>;

    constructor(private dataSource: DataSource) {
        this.repository = this.dataSource.getRepository(Emails);
    }

    // Expose common repository methods
    async findOne(options: any): Promise<Emails | null> {
        return this.repository.findOne(options);
    }

    async find(options?: any): Promise<Emails[]> {
        return this.repository.find(options);
    }

    async save(entity: Emails): Promise<Emails> {
        return this.repository.save(entity);
    }

    async remove(entity: Emails): Promise<Emails> {
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