import { registerAs } from '@nestjs/config';

export default registerAs('mail', () => ({
  protocol: process.env.MAIL_PROTOCOL,
  user: process.env.MAIL_USER,
  password: process.env.MAIL_PASSWORD,
  port: process.env.MAIL_PORT,
  domain: process.env.MAIL_DOMAIN,
  agent: process.env.MAIL_AGENT,
  contact: process.env.MAIL_CONTACT
}));
