/**
 * Service dealing with app config based operations.
 *
 * @class
 */
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get name(): string {
    return this.configService.get<string>('app.name');
  }
  get env(): string {
    return this.configService.get<string>('app.env');
  }
  get url(): string {
    return this.configService.get<string>('app.url');
  }
  get domain(): string {
    return this.configService.get<string>('app.domain');
  }
  get port(): number {
    return Number(this.configService.get<number>('app.port'));
  }
  get jwtSecret(): string {
    return this.configService.get<string>('app.jwtSecret');
  }
  get jwtExpiresIn(): string {
    return this.configService.get('app.jwtExpiresIn');
  }
  get perchwellUsername(): string {
    return this.configService.get('app.perchwellUsername');
  }
  get perchwellPassword(): string {
    return this.configService.get('app.perchwellPassword');
  }

  get dataCityOfNewYorkUsername(): string {
    return this.configService.get('app.dataCityOfNewYorkUsername');
  }

  get dataCityOfNewYorkPassword(): string {
    return this.configService.get('app.dataCityOfNewYorkPassword');
  }

  get dataCityOfNewYorkAppToken(): string {
    return this.configService.get('app.dataCityOfNewYorkAppToken');
  }

  get trestleClientId(): string {
    return this.configService.get('app.trestleClientId');
  }

  get trestleSecreteKey(): string {
    return this.configService.get('app.trestleClientSecrete');
  }

  get mapQuestKey(): string {
    return this.configService.get('app.mapQuestServiceKey');
  }

  get geocodeMapsKey(): string {
    return this.configService.get('app.geocodeMapsKey');
  }

  get cronJobsActive(): string {
    return this.configService.get<string>('app.cronJobsActive');
  }
}
