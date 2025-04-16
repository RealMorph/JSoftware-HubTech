import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class VerifyTwoFactorDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}

export class TwoFactorCodeVerificationDto {
  @IsString()
  @IsNotEmpty()
  tempToken: string;

  @IsString()
  @IsNotEmpty()
  code: string;
}

export class DisableTwoFactorDto {
  @IsString()
  @IsNotEmpty()
  code: string;
} 