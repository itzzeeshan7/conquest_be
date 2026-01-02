import {Repository, DataSource} from "typeorm";
import {LocationEntity} from "../entities/Location.entity";
import {Injectable} from "@nestjs/common";

@Injectable()
export class LocationRepository {
    private repository: Repository<LocationEntity>;

    constructor(private dataSource: DataSource) {
        this.repository = this.dataSource.getRepository(LocationEntity);
    }

    // Expose common repository methods
    async findOne(options: any): Promise<LocationEntity | null> {
        return this.repository.findOne(options);
    }

    async find(options?: any): Promise<LocationEntity[]> {
        return this.repository.find(options);
    }

    async save(entity: LocationEntity | LocationEntity[]): Promise<any> {
        return this.repository.save(entity as any);
    }

    async remove(entity: LocationEntity): Promise<LocationEntity> {
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
