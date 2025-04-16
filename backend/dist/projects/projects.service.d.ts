import { CreateProjectDto, UpdateProjectDto, ProjectStatus, ProjectVisibility } from './dto/project.dto';
import { AddProjectTagDto, RemoveProjectTagDto, ProjectFileDto, UpdateFileDto, FileType, FileUploadDto, MoveFileDto, FileDownloadResponseDto, FilePermission, FileFormat, FileSizeLimitDto, UpdateFilePermissionsDto, ShareFileWithUserDto, ShareFileWithEmailDto, GenerateShareLinkDto, ShareLinkResponseDto } from './dto/project-features.dto';
export declare class ProjectsService {
    private projects;
    private projectFiles;
    private projectActivities;
    private filePermissions;
    private shareLinks;
    private userShares;
    private emailShares;
    private uploadBasePath;
    private globalFileSizeLimit;
    private fileSizeLimits;
    constructor();
    createProject(createProjectDto: CreateProjectDto, userId: string): Promise<{
        id: string;
        name: string;
        description: string;
        status: ProjectStatus;
        visibility: ProjectVisibility;
        tags: string[];
        startDate: string;
        endDate: string;
        createdAt: string;
        updatedAt: string;
        ownerId: string;
    }>;
    getProjects(userId: string): Promise<any[]>;
    getProjectById(projectId: string, userId: string): Promise<any>;
    updateProject(projectId: string, updateProjectDto: UpdateProjectDto, userId: string): Promise<any>;
    deleteProject(projectId: string, userId: string): Promise<{
        message: string;
        project: any;
    }>;
    archiveProject(projectId: string, userId: string): Promise<any>;
    getProjectTags(projectId: string, userId: string): Promise<{
        tags: any;
    }>;
    addProjectTag(projectId: string, tagDto: AddProjectTagDto, userId: string): Promise<{
        message: string;
        tags: any;
    }>;
    removeProjectTag(projectId: string, tagDto: RemoveProjectTagDto, userId: string): Promise<{
        message: string;
        tags: any;
    }>;
    updateProjectTags(projectId: string, tagsDto: {
        tags: string[];
    }, userId: string): Promise<{
        message: string;
        tags: string[];
    }>;
    getProjectFiles(projectId: string, userId: string, fileType?: FileType): Promise<any[]>;
    getProjectFile(projectId: string, fileId: string, userId: string): Promise<any>;
    addProjectFile(projectId: string, fileDto: ProjectFileDto, userId: string): Promise<{
        uploadedBy: string;
        uploadedAt: string;
        updatedAt: string;
        name: string;
        path: string;
        type: FileType;
        size: number;
        description?: string;
        format?: FileFormat;
        id: string;
        projectId: string;
    }>;
    updateProjectFile(projectId: string, fileId: string, updateDto: UpdateFileDto, userId: string): Promise<any>;
    deleteProjectFile(projectId: string, fileId: string, userId: string): Promise<{
        message: string;
        file: any;
    }>;
    private trackActivity;
    getProjectActivities(projectId: string, userId: string, limit?: number): Promise<any[]>;
    uploadProjectFile(projectId: string, fileDto: FileUploadDto, userId: string): Promise<any>;
    downloadProjectFile(projectId: string, fileId: string, userId: string): Promise<FileDownloadResponseDto>;
    moveProjectFile(projectId: string, fileId: string, moveDto: MoveFileDto, userId: string): Promise<any>;
    getFilePermissions(fileId: string, userId: string): Promise<any>;
    setFilePermissions(fileId: string, userId: string, permissions: FilePermission[]): Promise<any>;
    updateFilePermissions(projectId: string, fileId: string, permissionsDto: UpdateFilePermissionsDto, userId: string): Promise<any>;
    shareFileWithUser(projectId: string, fileId: string, shareDto: ShareFileWithUserDto, userId: string): Promise<any>;
    shareFileWithEmail(projectId: string, fileId: string, shareDto: ShareFileWithEmailDto, userId: string): Promise<any>;
    generateShareLink(projectId: string, fileId: string, shareLinkDto: GenerateShareLinkDto, userId: string): Promise<ShareLinkResponseDto>;
    accessSharedFile(token: string, password?: string): Promise<any>;
    updateFileSizeLimit(limitDto: FileSizeLimitDto): Promise<any>;
    private hasFilePermission;
    private validateFilePermission;
    private findFileById;
    private detectFileFormat;
}
