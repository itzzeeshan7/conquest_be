import { BadRequestException, Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { AppConfigService } from '../../config/app/config.service';
import { activationMail } from '../../mail-templates/activation-mail';
import { updateNotificationTemplate } from '../../mail-templates/update-notification.mail'
import { URL_CONSTANTS } from '../constants/url.constants';
import { SentMessageInfo } from 'nodemailer';
import { resetPasswordMail } from '../../mail-templates/reset-password.mail';
import { contactUs } from '../../mail-templates/contact-us';
import { scheduledViewingTemplate } from '../../mail-templates/scheduled-viewiing';
import { MailConfigService } from '../../config/mail/config.service';
import { ContactDto } from '../../modules/users/dto/Contact.dto';
import { Emails } from './entities/Emails.entity';
import { EmailsRepository } from './repositories/emails.repository';
import { ScheduledViewingDto } from '../../modules/users/dto/ScheduledViewing.dto';
import { Users } from '../../modules/users/entities/Users.entity';
import { ListingEntity } from '../../modules/listings/entities/Listing.entity';
import { UserRolesService } from '../../modules/users/services/userRoles.service';
import { UsersService } from '../../modules/users/services/users.service';
import { SuccessResponseDto } from '../dto/SuccessResponse.dto';
import { PropertyEntity } from '../../modules/listings/entities/Property.entity';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly appConfigService: AppConfigService,
    // private readonly mailConfigService: MailConfigService,
    private readonly emailsRepository: EmailsRepository,
  ) { }

  public async sendActivationEmail(
    code: string,
    to: string
  ): Promise<SentMessageInfo> {
    const body = activationMail(
      URL_CONSTANTS.EMAIL_ACTIVATION(this.appConfigService.domain, code)
    );
    const email = {
      emailFrom: 'server',
      emailTo: to,
      subject: 'EMAIL_ACTIVATION',
      message: null,
      name: null,
      phone: null
    } as Emails as undefined

    await this.emailsRepository.save(email);

    return this.sendMail(body, 'E-mail activation', to);
  }

  public async resetPasswordEmail(code: string, to: string) {
    const body = resetPasswordMail(
      URL_CONSTANTS.EMAIL_PASSWORD_RESET(this.appConfigService.domain, code)
    );

    const email = {
      emailFrom: 'server',
      emailTo: to,
      subject: 'RESET_PASSWORD',
      message: null,
      name: null,
      phone: null
    } as Emails as undefined

    await this.emailsRepository.save(email);
    return this.sendMail(body, 'Reset password', to);
  }

  public async contactAgent(contactMessage: ContactDto, agents: Users[]): Promise<SuccessResponseDto> {
    const agentsEmail = agents.map(agent => agent.email);
    const body = contactUs(
      contactMessage.message,
      contactMessage.name,
      contactMessage.phone,
      contactMessage.email
    );
    const email = {
      emailFrom: contactMessage.email,
      emailTo: agentsEmail.toString(),
      subject: contactMessage.subject,
      message: contactMessage.message,
      name: contactMessage.name,
      phone: contactMessage.phone
    } as Emails as undefined

    try {
      await this.emailsRepository.save(email);

      this.sendMail(
        body,
        contactMessage.subject,
        agentsEmail
      );
    } catch (e) {
      throw new BadRequestException();
    }
    return new SuccessResponseDto({ message: true });
  }

  public async scheduledViewing(scheduledViewing: ScheduledViewingDto, type: string, user: Users, property: PropertyEntity, agents: Users[]) {
    const bodySchedule = scheduledViewingTemplate(scheduledViewing, property)
    const agentsEmail = agents.map(agent => agent['u_email']);

    const email = {
      emailFrom: user.email,
      emailTo: agentsEmail.toString(),
      subject: type,
      message: scheduledViewing.message,
      name: user.name,
      phone: user.phone
    } as Emails as undefined

    await this.emailsRepository.save(email);

    try {
      this.sendMail(bodySchedule, type, user.email);

      if (agentsEmail.length > 0) {
        this.agentScheduled(user, scheduledViewing.message, type, agentsEmail);
      }
    } catch (e) {
      throw new BadRequestException();
    }
  }

  public alertMail(alert: string, agentsEmails: string[]) {
    if (agentsEmails.length > 0) {
      this.sendMail(alert, '3rd party API need Update', agentsEmails);
    }
  }

  public sendNotificationMail(userInfo: any, listings: any) {
    const body = updateNotificationTemplate(userInfo, listings);

    try {
      this.sendMail(body, 'Updated listings you saved', userInfo.email);
    } catch (e) {
      throw new BadRequestException();
    }
  }

  private agentScheduled(user: Users, message: string, subject: string, to: string | string[]) {
    const body = contactUs(
      message,
      user.name,
      user.phone,
      user.email
    )
    this.sendMail(
      body,
      subject,
      to
    );
  }

  private sendMail(
    text: string,
    subject: string,
    to: string[] | string
  ): Promise<SentMessageInfo> {
    return this.mailerService.sendMail({
      from: `noreplay@${this.appConfigService.domain}`,
      to,
      subject,
      html: text,
    });
  }
}
