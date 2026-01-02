import {Repository, DataSource} from "typeorm";
import { PropertyEntity } from "../entities/Property.entity";
import {Injectable} from "@nestjs/common";


@Injectable()
export class PropertyRepository {
    private repository: Repository<PropertyEntity>;

    constructor(private dataSource: DataSource) {
        this.repository = this.dataSource.getRepository(PropertyEntity);
    }

    // Expose common repository methods
    async findOne(options: any): Promise<PropertyEntity | null> {
        return this.repository.findOne(options);
    }

    async find(options?: any): Promise<PropertyEntity[]> {
        return this.repository.find(options);
    }

    async save(entity: PropertyEntity | PropertyEntity[]): Promise<any> {
        return this.repository.save(entity as any);
    }

    async remove(entity: PropertyEntity): Promise<PropertyEntity> {
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
