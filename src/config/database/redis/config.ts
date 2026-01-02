import {registerAs} from "@nestjs/config";

export default registerAs('redis', () => ({
    host: process.env.REDIS_HOST,
    db: process.env.REDIS_NAME,
    user: process.env.REDIS_USER,
    port: process.env.REDIS_PORT
}))
