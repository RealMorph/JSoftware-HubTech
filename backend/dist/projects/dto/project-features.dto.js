"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectActivityDto = exports.UpdateFilePermissionsDto = exports.ShareLinkResponseDto = exports.GenerateShareLinkDto = exports.ShareFileWithEmailDto = exports.ShareFileWithUserDto = exports.FileShareSettingsDto = exports.FileUserPermissionDto = exports.UpdateFileDto = exports.MoveFileDto = exports.FileDownloadResponseDto = exports.FileSizeLimitDto = exports.FileUploadDto = exports.ProjectFileDto = exports.RemoveProjectTagDto = exports.AddProjectTagDto = exports.ProjectTagsDto = exports.FileFormat = exports.FilePermission = exports.ActivityType = exports.FileType = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var FileType;
(function (FileType) {
    FileType["DOCUMENT"] = "document";
    FileType["IMAGE"] = "image";
    FileType["VIDEO"] = "video";
    FileType["AUDIO"] = "audio";
    FileType["ARCHIVE"] = "archive";
    FileType["OTHER"] = "other";
})(FileType || (exports.FileType = FileType = {}));
var ActivityType;
(function (ActivityType) {
    ActivityType["CREATED"] = "created";
    ActivityType["UPDATED"] = "updated";
    ActivityType["DELETED"] = "deleted";
    ActivityType["COMMENTED"] = "commented";
    ActivityType["FILE_ADDED"] = "file_added";
    ActivityType["FILE_UPDATED"] = "file_updated";
    ActivityType["FILE_DELETED"] = "file_deleted";
    ActivityType["FILE_MOVED"] = "file_moved";
    ActivityType["FILE_DOWNLOADED"] = "file_downloaded";
    ActivityType["FILE_SHARED"] = "file_shared";
    ActivityType["FILE_PERMISSION_UPDATED"] = "file_permission_updated";
    ActivityType["TAG_ADDED"] = "tag_added";
    ActivityType["TAG_REMOVED"] = "tag_removed";
})(ActivityType || (exports.ActivityType = ActivityType = {}));
var FilePermission;
(function (FilePermission) {
    FilePermission["VIEW"] = "view";
    FilePermission["DOWNLOAD"] = "download";
    FilePermission["EDIT"] = "edit";
    FilePermission["DELETE"] = "delete";
    FilePermission["SHARE"] = "share";
    FilePermission["FULL_ACCESS"] = "full_access";
})(FilePermission || (exports.FilePermission = FilePermission = {}));
var FileFormat;
(function (FileFormat) {
    FileFormat["PDF"] = "pdf";
    FileFormat["DOC"] = "doc";
    FileFormat["DOCX"] = "docx";
    FileFormat["XLS"] = "xls";
    FileFormat["XLSX"] = "xlsx";
    FileFormat["PPT"] = "ppt";
    FileFormat["PPTX"] = "pptx";
    FileFormat["TXT"] = "txt";
    FileFormat["RTF"] = "rtf";
    FileFormat["JPG"] = "jpg";
    FileFormat["JPEG"] = "jpeg";
    FileFormat["PNG"] = "png";
    FileFormat["GIF"] = "gif";
    FileFormat["BMP"] = "bmp";
    FileFormat["SVG"] = "svg";
    FileFormat["WEBP"] = "webp";
    FileFormat["MP4"] = "mp4";
    FileFormat["AVI"] = "avi";
    FileFormat["MOV"] = "mov";
    FileFormat["WMV"] = "wmv";
    FileFormat["MKV"] = "mkv";
    FileFormat["MP3"] = "mp3";
    FileFormat["WAV"] = "wav";
    FileFormat["OGG"] = "ogg";
    FileFormat["FLAC"] = "flac";
    FileFormat["ZIP"] = "zip";
    FileFormat["RAR"] = "rar";
    FileFormat["TAR"] = "tar";
    FileFormat["GZIP"] = "gz";
    FileFormat["OTHER"] = "other";
})(FileFormat || (exports.FileFormat = FileFormat = {}));
class ProjectTagsDto {
}
exports.ProjectTagsDto = ProjectTagsDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ProjectTagsDto.prototype, "tags", void 0);
class AddProjectTagDto {
}
exports.AddProjectTagDto = AddProjectTagDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AddProjectTagDto.prototype, "tag", void 0);
class RemoveProjectTagDto {
}
exports.RemoveProjectTagDto = RemoveProjectTagDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RemoveProjectTagDto.prototype, "tag", void 0);
class ProjectFileDto {
}
exports.ProjectFileDto = ProjectFileDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ProjectFileDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ProjectFileDto.prototype, "path", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(FileType),
    __metadata("design:type", String)
], ProjectFileDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ProjectFileDto.prototype, "size", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ProjectFileDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(FileFormat),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ProjectFileDto.prototype, "format", void 0);
class FileUploadDto {
}
exports.FileUploadDto = FileUploadDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], FileUploadDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(FileType),
    __metadata("design:type", String)
], FileUploadDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(FileFormat),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FileUploadDto.prototype, "format", void 0);
__decorate([
    (0, class_validator_1.IsBase64)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], FileUploadDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], FileUploadDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Max)(209715200),
    __metadata("design:type", Number)
], FileUploadDto.prototype, "size", void 0);
class FileSizeLimitDto {
}
exports.FileSizeLimitDto = FileSizeLimitDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], FileSizeLimitDto.prototype, "maxFileSize", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(FileType, { each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], FileSizeLimitDto.prototype, "affectedTypes", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(FileFormat, { each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], FileSizeLimitDto.prototype, "affectedFormats", void 0);
class FileDownloadResponseDto {
}
exports.FileDownloadResponseDto = FileDownloadResponseDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], FileDownloadResponseDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(FileType),
    __metadata("design:type", String)
], FileDownloadResponseDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(FileFormat),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FileDownloadResponseDto.prototype, "format", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], FileDownloadResponseDto.prototype, "size", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsBase64)(),
    __metadata("design:type", String)
], FileDownloadResponseDto.prototype, "content", void 0);
class MoveFileDto {
}
exports.MoveFileDto = MoveFileDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], MoveFileDto.prototype, "targetProjectId", void 0);
class UpdateFileDto {
}
exports.UpdateFileDto = UpdateFileDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateFileDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateFileDto.prototype, "description", void 0);
class FileUserPermissionDto {
}
exports.FileUserPermissionDto = FileUserPermissionDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], FileUserPermissionDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(FilePermission, { each: true }),
    (0, class_validator_1.ArrayMinSize)(1),
    __metadata("design:type", Array)
], FileUserPermissionDto.prototype, "permissions", void 0);
class FileShareSettingsDto {
}
exports.FileShareSettingsDto = FileShareSettingsDto;
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], FileShareSettingsDto.prototype, "isPublic", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FileShareSettingsDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], FileShareSettingsDto.prototype, "expirationDate", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(FilePermission, { each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], FileShareSettingsDto.prototype, "allowedPermissions", void 0);
class ShareFileWithUserDto {
}
exports.ShareFileWithUserDto = ShareFileWithUserDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ShareFileWithUserDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(FilePermission, { each: true }),
    (0, class_validator_1.ArrayMinSize)(1),
    __metadata("design:type", Array)
], ShareFileWithUserDto.prototype, "permissions", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ShareFileWithUserDto.prototype, "message", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], ShareFileWithUserDto.prototype, "expirationDate", void 0);
class ShareFileWithEmailDto {
}
exports.ShareFileWithEmailDto = ShareFileWithEmailDto;
__decorate([
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ShareFileWithEmailDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(FilePermission, { each: true }),
    (0, class_validator_1.ArrayMinSize)(1),
    __metadata("design:type", Array)
], ShareFileWithEmailDto.prototype, "permissions", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ShareFileWithEmailDto.prototype, "message", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], ShareFileWithEmailDto.prototype, "expirationDate", void 0);
class GenerateShareLinkDto {
}
exports.GenerateShareLinkDto = GenerateShareLinkDto;
__decorate([
    (0, class_validator_1.IsEnum)(FilePermission, { each: true }),
    (0, class_validator_1.ArrayMinSize)(1),
    __metadata("design:type", Array)
], GenerateShareLinkDto.prototype, "permissions", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], GenerateShareLinkDto.prototype, "expirationDate", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GenerateShareLinkDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], GenerateShareLinkDto.prototype, "maxUses", void 0);
class ShareLinkResponseDto {
}
exports.ShareLinkResponseDto = ShareLinkResponseDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ShareLinkResponseDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], ShareLinkResponseDto.prototype, "url", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(FilePermission, { each: true }),
    __metadata("design:type", Array)
], ShareLinkResponseDto.prototype, "permissions", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], ShareLinkResponseDto.prototype, "expirationDate", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ShareLinkResponseDto.prototype, "isPasswordProtected", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ShareLinkResponseDto.prototype, "maxUses", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ShareLinkResponseDto.prototype, "usesCount", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], ShareLinkResponseDto.prototype, "createdAt", void 0);
class UpdateFilePermissionsDto {
}
exports.UpdateFilePermissionsDto = UpdateFilePermissionsDto;
__decorate([
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => FileUserPermissionDto),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], UpdateFilePermissionsDto.prototype, "userPermissions", void 0);
class ProjectActivityDto {
}
exports.ProjectActivityDto = ProjectActivityDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ProjectActivityDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ProjectActivityDto.prototype, "projectId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ProjectActivityDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(ActivityType),
    __metadata("design:type", String)
], ProjectActivityDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProjectActivityDto.prototype, "timestamp", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], ProjectActivityDto.prototype, "details", void 0);
//# sourceMappingURL=project-features.dto.js.map