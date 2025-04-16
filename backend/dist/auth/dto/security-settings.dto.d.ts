export declare enum DataSharingLevel {
    NONE = "none",
    BASIC = "basic",
    ENHANCED = "enhanced",
    MINIMAL = "minimal",
    FULL = "full",
    CUSTOM = "custom"
}
export declare enum ApiKeyPermission {
    READ = "read",
    WRITE = "write",
    ADMIN = "admin",
    DELETE = "delete"
}
export declare class PrivacySettingsDto {
    dataSharingLevel: DataSharingLevel;
    showProfileToPublic: boolean;
    showActivityHistory: boolean;
    allowThirdPartyDataSharing: boolean;
    allowAnalyticsCookies: boolean;
}
export declare class ApiKeyDto {
    name: string;
    permissions: ApiKeyPermission[];
    description?: string;
}
export declare class ApiKeyResponseDto {
    id: string;
    name: string;
    permissions: ApiKeyPermission[];
}
export declare class SessionTimeoutDto {
    timeoutMinutes: string;
}
