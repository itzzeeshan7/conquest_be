import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { AppConfigModule } from '../../config/app/config.module';
import { MailConfigService } from '../../config/mail/config.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailsRepository } from './repositories/emails.repository';

@Module({
  imports: [AppConfigModule, TypeOrmModule.forFeature([])],
  providers: [
    MailService,
    MailConfigService,
    EmailsRepository,
  ],
  exports: [MailService],
})
export class MailModule { }
