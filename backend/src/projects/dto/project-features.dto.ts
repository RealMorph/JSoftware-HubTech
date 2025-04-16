import { IsString, IsNotEmpty, IsOptional, IsArray, IsUUID, IsEnum, IsBoolean, IsDate, IsNumber, IsObject, IsBase64, IsEmail, IsUrl, ValidateNested, Min, Max, IsPositive, ArrayMinSize, ArrayMaxSize, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export enum FileType {
  DOCUMENT = 'document',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  ARCHIVE = 'archive',
  OTHER = 'other'
}

export enum ActivityType {
  CREATED = 'created',
  UPDATED = 'updated',
  DELETED = 'deleted',
  COMMENTED = 'commented',
  FILE_ADDED = 'file_added',
  FILE_UPDATED = 'file_updated',
  FILE_DELETED = 'file_deleted',
  FILE_MOVED = 'file_moved',
  FILE_DOWNLOADED = 'file_downloaded',
  FILE_SHARED = 'file_shared',
  FILE_PERMISSION_UPDATED = 'file_permission_updated',
  TAG_ADDED = 'tag_added',
  TAG_REMOVED = 'tag_removed'
}

export enum FilePermission {
  VIEW = 'view',
  DOWNLOAD = 'download',
  EDIT = 'edit',
  DELETE = 'delete',
  SHARE = 'share',
  FULL_ACCESS = 'full_access'
}

export enum FileFormat {
  // Document formats
  PDF = 'pdf',
  DOC = 'doc',
  DOCX = 'docx',
  XLS = 'xls',
  XLSX = 'xlsx',
  PPT = 'ppt',
  PPTX = 'pptx',
  TXT = 'txt',
  RTF = 'rtf',
  
  // Image formats
  JPG = 'jpg',
  JPEG = 'jpeg',
  PNG = 'png',
  GIF = 'gif',
  BMP = 'bmp',
  SVG = 'svg',
  WEBP = 'webp',
  
  // Video formats
  MP4 = 'mp4',
  AVI = 'avi',
  MOV = 'mov',
  WMV = 'wmv',
  MKV = 'mkv',
  
  // Audio formats
  MP3 = 'mp3',
  WAV = 'wav',
  OGG = 'ogg',
  FLAC = 'flac',
  
  // Archive formats
  ZIP = 'zip',
  RAR = 'rar',
  TAR = 'tar',
  GZIP = 'gz',
  
  // Other formats
  OTHER = 'other'
}

export class ProjectTagsDto {
  @IsArray()
  @IsString({ each: true })
  tags: string[];
}

export class AddProjectTagDto {
  @IsString()
  @IsNotEmpty()
  tag: string;
}

export class RemoveProjectTagDto {
  @IsString()
  @IsNotEmpty()
  tag: string;
}

export class ProjectFileDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  path: string;

  @IsEnum(FileType)
  type: FileType;

  @IsNumber()
  size: number;

  @IsString()
  @IsOptional()
  description?: string;
  
  @IsEnum(FileFormat)
  @IsOptional()
  format?: FileFormat;
}

export class FileUploadDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsEnum(FileType)
  type: FileType;
  
  @IsEnum(FileFormat)
  @IsOptional()
  format?: FileFormat;

  @IsBase64()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;
  
  @IsNumber()
  @IsOptional()
  @Max(209715200) // 200 MB limit in bytes
  size?: number;
}

export class FileSizeLimitDto {
  @IsNumber()
  @IsPositive()
  maxFileSize: number; // in bytes
  
  @IsEnum(FileType, { each: true })
  @IsOptional()
  affectedTypes?: FileType[];
  
  @IsEnum(FileFormat, { each: true })
  @IsOptional()
  affectedFormats?: FileFormat[];
}

export class FileDownloadResponseDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(FileType)
  type: FileType;
  
  @IsEnum(FileFormat)
  @IsOptional()
  format?: FileFormat;

  @IsNumber()
  size: number;

  @IsString()
  @IsBase64()
  content: string;
}

export class MoveFileDto {
  @IsUUID()
  @IsNotEmpty()
  targetProjectId: string;
}

export class UpdateFileDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class FileUserPermissionDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;
  
  @IsEnum(FilePermission, { each: true })
  @ArrayMinSize(1)
  permissions: FilePermission[];
}

export class FileShareSettingsDto {
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
  
  @IsString()
  @IsOptional()
  password?: string;
  
  @IsDate()
  @IsOptional()
  expirationDate?: Date;
  
  @IsEnum(FilePermission, { each: true })
  @IsOptional()
  allowedPermissions?: FilePermission[];
}

export class ShareFileWithUserDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;
  
  @IsEnum(FilePermission, { each: true })
  @ArrayMinSize(1)
  permissions: FilePermission[];
  
  @IsString()
  @IsOptional()
  message?: string;
  
  @IsDate()
  @IsOptional()
  expirationDate?: Date;
}

export class ShareFileWithEmailDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
  
  @IsEnum(FilePermission, { each: true })
  @ArrayMinSize(1)
  permissions: FilePermission[];
  
  @IsString()
  @IsOptional()
  message?: string;
  
  @IsDate()
  @IsOptional()
  expirationDate?: Date;
}

export class GenerateShareLinkDto {
  @IsEnum(FilePermission, { each: true })
  @ArrayMinSize(1)
  permissions: FilePermission[];
  
  @IsDate()
  @IsOptional()
  expirationDate?: Date;
  
  @IsString()
  @IsOptional()
  password?: string;
  
  @IsNumber()
  @IsOptional()
  @IsPositive()
  maxUses?: number;
}

export class ShareLinkResponseDto {
  @IsUUID()
  id: string;
  
  @IsUrl()
  url: string;
  
  @IsEnum(FilePermission, { each: true })
  permissions: FilePermission[];
  
  @IsDate()
  @IsOptional()
  expirationDate?: Date;
  
  @IsBoolean()
  isPasswordProtected: boolean;
  
  @IsNumber()
  @IsOptional()
  maxUses?: number;
  
  @IsNumber()
  @IsOptional()
  usesCount?: number;
  
  @IsDate()
  createdAt: Date;
}

export class UpdateFilePermissionsDto {
  @ValidateNested({ each: true })
  @Type(() => FileUserPermissionDto)
  @IsArray()
  userPermissions: FileUserPermissionDto[];
}

export class ProjectActivityDto {
  @IsUUID()
  id: string;

  @IsUUID()
  projectId: string;

  @IsUUID()
  userId: string;

  @IsEnum(ActivityType)
  type: ActivityType;

  @IsString()
  timestamp: string;

  @IsObject()
  @IsOptional()
  details?: Record<string, any>;
} 