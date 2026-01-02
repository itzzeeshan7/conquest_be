import {
  IsEmail,
  IsEmpty,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
} from 'class-validator';

export class ContactDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsPhoneNumber('US')
  @IsOptional()
  phone?: string;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsString()
  subject: string;

  @IsOptional()
  @IsObject()
  extraInfo: object;

  @IsNotEmpty()
  @IsUUID('4')
  code: string;
}
