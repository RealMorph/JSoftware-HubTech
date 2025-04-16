export declare enum ProjectStatus {
    ACTIVE = "active",
    ARCHIVED = "archived",
    COMPLETED = "completed",
    ON_HOLD = "on_hold"
}
export declare enum ProjectVisibility {
    PUBLIC = "public",
    PRIVATE = "private",
    TEAM = "team"
}
export declare class CreateProjectDto {
    name: string;
    description?: string;
    status?: ProjectStatus;
    visibility?: ProjectVisibility;
    tags?: string[];
    startDate?: string;
    endDate?: string;
}
export declare class UpdateProjectDto {
    name?: string;
    description?: string;
    status?: ProjectStatus;
    visibility?: ProjectVisibility;
    tags?: string[];
    startDate?: string;
    endDate?: string;
}
export declare class ProjectResponseDto {
    id: string;
    name: string;
    description?: string;
    status: ProjectStatus;
    visibility: ProjectVisibility;
    tags: string[];
    createdAt: string;
    updatedAt?: string;
    ownerId: string;
    startDate?: string;
    endDate?: string;
}
