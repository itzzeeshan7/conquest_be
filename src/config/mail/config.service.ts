/**
 * Service dealing with app config based operations.
 *
 * @class
 */
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailConfigService {
  constructor(private configService: ConfigService) { }

  get protocol(): string {
    return this.configService.get<string>('mail.protocol');
  }

  get user(): string {
    return this.configService.get<string>('mail.user');
  }

  get password(): string {
    return this.configService.get<string>('mail.password');
  }

  get port(): number {
    return this.configService.get<number>('mail.port');
  }

  get host(): string {
    return this.configService.get<string>('mail.host');
  }

  get domain(): string {
    return this.configService.get<string>('mail.domain');
  }

  get agent(): string {
    return this.configService.get<string>('mail.agent');
  }

  get contact(): string {
    return this.configService.get<string>('mail.contact');
  }
}
