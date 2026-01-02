import { Injectable } from '@nestjs/common';
import { InjectRedis } from "@nestjs-modules/ioredis";
import Redis from "ioredis";

@Injectable()
export class RedisServiceAdapter {
    constructor(
        @InjectRedis() public readonly client: Redis
    ) {}

    public async set(
        key: string,
        value: string,
        expiryMode?: string | any[],
        time?: number | string,
        setMode?: number | string
    ): Promise<string> {
        return this.client.set(key, value);
    }

    public async setWithExp(
        key: string,
        value: string,
        expiryMode?: string | any[],
        time?: number | string,
        setMode?: number | string
    ): Promise<string> {
        if (expiryMode === 'EX' && typeof time === 'number') {
            return this.client.set(key, value, 'EX', time);
        } else if (expiryMode === 'PX' && typeof time === 'number') {
            return this.client.set(key, value, 'PX', time);
        }
        return this.client.set(key, value);
    }

    public async get(key: string): Promise<string> {
        return this.client.get(key);
    }

    public async delete(key: string): Promise<number> {
        return this.client.del(key);
    }

    public async bgsave(): Promise<string> {
        return this.client.bgsave();
    }
}
