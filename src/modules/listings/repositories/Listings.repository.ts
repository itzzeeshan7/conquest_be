import {Repository, DataSource} from "typeorm";
import {ListingEntity} from "../entities/Listing.entity";
import {Injectable} from "@nestjs/common";

@Injectable()
export class ListingsRepository {
    private repository: Repository<ListingEntity>;

    constructor(private dataSource: DataSource) {
        this.repository = this.dataSource.getRepository(ListingEntity);
    }

    // Expose common repository methods
    async findOne(options: any): Promise<ListingEntity | null> {
        return this.repository.findOne(options);
    }

    async find(options?: any): Promise<ListingEntity[]> {
        return this.repository.find(options);
    }

    async save(entity: ListingEntity | ListingEntity[]): Promise<any> {
        return this.repository.save(entity as any);
    }

    async remove(entity: ListingEntity): Promise<ListingEntity> {
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
