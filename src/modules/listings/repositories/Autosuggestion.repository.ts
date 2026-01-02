import {Repository, DataSource} from "typeorm";
import { Autosuggestion } from "../entities/Autosuggestion.entity";
import {Injectable} from "@nestjs/common";

@Injectable()
export class AutosuggestionRepository {
    private repository: Repository<Autosuggestion>;

    constructor(private dataSource: DataSource) {
        this.repository = this.dataSource.getRepository(Autosuggestion);
    }

    // Expose common repository methods
    async findOne(options: any): Promise<Autosuggestion | null> {
        return this.repository.findOne(options);
    }

    async find(options?: any): Promise<Autosuggestion[]> {
        return this.repository.find(options);
    }

    async save(entity: Autosuggestion | Autosuggestion[]): Promise<any> {
        return this.repository.save(entity as any);
    }

    async remove(entity: Autosuggestion): Promise<Autosuggestion> {
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
