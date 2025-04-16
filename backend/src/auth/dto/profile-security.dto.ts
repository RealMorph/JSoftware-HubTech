import { IsNotEmpty, IsString, MinLength, IsArray, ValidateNested, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'New password must be at least 8 characters long' })
  newPassword: string;
}

export class SecurityQuestionDto {
  @IsString()
  @IsNotEmpty()
  question: string;

  @IsString()
  @IsNotEmpty()
  answer: string;
}

export class SecurityQuestionsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SecurityQuestionDto)
  questions: SecurityQuestionDto[];
}

export class LoginHistoryQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
} 