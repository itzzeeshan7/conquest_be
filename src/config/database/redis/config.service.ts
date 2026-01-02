/**
 * Service dealing with app config based operations.
 *
 * @class
 */
import {ConfigService} from "@nestjs/config";
import {Injectable} from "@nestjs/common";

@Injectable()
export class RedisConfigService {
    constructor(private configService: ConfigService) {}

    get host(): string {
        return this.configService.get<string>('redis-adapter.host');
    }
    get db(): number {
        return this.configService.get<number>('redis-adapter.db');
    }
    get password(): string {
        return this.configService.get<string>('redis-adapter.password');
    }
    get port(): number {
        return this.configService.get<number>('redis-adapter.port');
    }
}
