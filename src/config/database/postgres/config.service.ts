/**
 * Service dealing with app config based operations.
 *
 * @class
 */
import {ConfigService} from "@nestjs/config";
import {Injectable} from "@nestjs/common";

@Injectable()
export class DataBaseConfigService {
    constructor(private configService: ConfigService) {}

    get name(): string {
        return this.configService.get<string>('db.name');
    }
    get port(): number {
        return this.configService.get<number>('db.port');
    }
    get host(): string {
        return this.configService.get<string>('db.host');
    }
    get user(): string {
        return this.configService.get<string>('db.user');
    }
    get password(): string {
        return this.configService.get<string>('db.password');
    }
}
