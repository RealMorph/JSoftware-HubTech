import { IsString, IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class VerificationCodeDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}

export class PhoneNumberDto {
  @IsPhoneNumber(null, { message: 'Invalid phone number format' })
  @IsNotEmpty()
  phoneNumber: string;
} 