export declare enum FileType {
    DOCUMENT = "document",
    IMAGE = "image",
    VIDEO = "video",
    AUDIO = "audio",
    ARCHIVE = "archive",
    OTHER = "other"
}
export declare enum ActivityType {
    CREATED = "created",
    UPDATED = "updated",
    DELETED = "deleted",
    COMMENTED = "commented",
    FILE_ADDED = "file_added",
    FILE_UPDATED = "file_updated",
    FILE_DELETED = "file_deleted",
    FILE_MOVED = "file_moved",
    FILE_DOWNLOADED = "file_downloaded",
    FILE_SHARED = "file_shared",
    FILE_PERMISSION_UPDATED = "file_permission_updated",
    TAG_ADDED = "tag_added",
    TAG_REMOVED = "tag_removed"
}
export declare enum FilePermission {
    VIEW = "view",
    DOWNLOAD = "download",
    EDIT = "edit",
    DELETE = "delete",
    SHARE = "share",
    FULL_ACCESS = "full_access"
}
export declare enum FileFormat {
    PDF = "pdf",
    DOC = "doc",
    DOCX = "docx",
    XLS = "xls",
    XLSX = "xlsx",
    PPT = "ppt",
    PPTX = "pptx",
    TXT = "txt",
    RTF = "rtf",
    JPG = "jpg",
    JPEG = "jpeg",
    PNG = "png",
    GIF = "gif",
    BMP = "bmp",
    SVG = "svg",
    WEBP = "webp",
    MP4 = "mp4",
    AVI = "avi",
    MOV = "mov",
    WMV = "wmv",
    MKV = "mkv",
    MP3 = "mp3",
    WAV = "wav",
    OGG = "ogg",
    FLAC = "flac",
    ZIP = "zip",
    RAR = "rar",
    TAR = "tar",
    GZIP = "gz",
    OTHER = "other"
}
export declare class ProjectTagsDto {
    tags: string[];
}
export declare class AddProjectTagDto {
    tag: string;
}
export declare class RemoveProjectTagDto {
    tag: string;
}
export declare class ProjectFileDto {
    name: string;
    path: string;
    type: FileType;
    size: number;
    description?: string;
    format?: FileFormat;
}
export declare class FileUploadDto {
    name: string;
    type: FileType;
    format?: FileFormat;
    content: string;
    description?: string;
    size?: number;
}
export declare class FileSizeLimitDto {
    maxFileSize: number;
    affectedTypes?: FileType[];
    affectedFormats?: FileFormat[];
}
export declare class FileDownloadResponseDto {
    name: string;
    type: FileType;
    format?: FileFormat;
    size: number;
    content: string;
}
export declare class MoveFileDto {
    targetProjectId: string;
}
export declare class UpdateFileDto {
    name?: string;
    description?: string;
}
export declare class FileUserPermissionDto {
    userId: string;
    permissions: FilePermission[];
}
export declare class FileShareSettingsDto {
    isPublic?: boolean;
    password?: string;
    expirationDate?: Date;
    allowedPermissions?: FilePermission[];
}
export declare class ShareFileWithUserDto {
    userId: string;
    permissions: FilePermission[];
    message?: string;
    expirationDate?: Date;
}
export declare class ShareFileWithEmailDto {
    email: string;
    permissions: FilePermission[];
    message?: string;
    expirationDate?: Date;
}
export declare class GenerateShareLinkDto {
    permissions: FilePermission[];
    expirationDate?: Date;
    password?: string;
    maxUses?: number;
}
export declare class ShareLinkResponseDto {
    id: string;
    url: string;
    permissions: FilePermission[];
    expirationDate?: Date;
    isPasswordProtected: boolean;
    maxUses?: number;
    usesCount?: number;
    createdAt: Date;
}
export declare class UpdateFilePermissionsDto {
    userPermissions: FileUserPermissionDto[];
}
export declare class ProjectActivityDto {
    id: string;
    projectId: string;
    userId: string;
    type: ActivityType;
    timestamp: string;
    details?: Record<string, any>;
}
