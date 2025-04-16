import { IsEnum, IsNotEmpty, IsBoolean, IsString, IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum DataSharingLevel {
  NONE = 'none',
  BASIC = 'basic',
  ENHANCED = 'enhanced',
  MINIMAL = 'minimal',
  FULL = 'full',
  CUSTOM = 'custom'
}

export enum ApiKeyPermission {
  READ = 'read',
  WRITE = 'write',
  ADMIN = 'admin',
  DELETE = 'delete'
}

export class PrivacySettingsDto {
  @IsEnum(DataSharingLevel)
  @IsNotEmpty()
  dataSharingLevel: DataSharingLevel;

  @IsBoolean()
  showProfileToPublic: boolean;

  @IsBoolean()
  showActivityHistory: boolean;

  @IsBoolean()
  allowThirdPartyDataSharing: boolean;

  @IsBoolean()
  allowAnalyticsCookies: boolean;
}

export class ApiKeyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(ApiKeyPermission, { each: true })
  permissions: ApiKeyPermission[];

  @IsOptional()
  @IsString()
  description?: string;
}

export class ApiKeyResponseDto {
  @IsUUID()
  id: string;

  @IsString()
  name: string;

  @IsEnum(ApiKeyPermission, { each: true })
  permissions: ApiKeyPermission[];
}

export class SessionTimeoutDto {
  @IsNotEmpty()
  @IsString()
  timeoutMinutes: string;
} 