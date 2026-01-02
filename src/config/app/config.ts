import {registerAs} from "@nestjs/config";

export default registerAs('app', () => ({
    env: process.env.APP_ENV,
    url: process.env.APP_URL,
    port: process.env.APP_PORT,
    jwtSecret: process.env.APP_JWT_SECRET,
    jwtExpiresIn: process.env.APP_JWT_EXPIRES_IN,
    domain: process.env.APP_DOMAIN,
    perchwellUsername: process.env.PERCHWELL_USERNAME,
    perchwellPassword: process.env.PERCHWELL_PASSWORD,
    dataCityOfNewYorkUsername: process.env.DATA_CITYOFNEWYORK_USERNAME,
    dataCityOfNewYorkPassword: process.env.DATA_CITYOFNEWYORK_PASSWORD,
    dataCityOfNewYorkAppToken: process.env.DATA_CITYOFNEWYORK_APP_TOKEN,
    trestleClientId: process.env.TRESTLE_CLIENT_ID,
    trestleClientSecrete: process.env.TRESTLE_CLIENT_SECRETE,
    mapQuestServiceKey: process.env.MAP_QUEST_SERVICE_KEY,
    geocodeMapsKey: process.env.GEOCODE_MAPS_KEY,
    cronJobsActive: process.env.CRON_JOBS_ACTIVE,
}))
