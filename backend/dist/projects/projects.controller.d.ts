import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import { AddProjectTagDto, RemoveProjectTagDto, ProjectTagsDto, ProjectFileDto, UpdateFileDto, FileUploadDto, MoveFileDto, FileType, FileSizeLimitDto, UpdateFilePermissionsDto, ShareFileWithUserDto, ShareFileWithEmailDto, GenerateShareLinkDto, FileFormat } from './dto/project-features.dto';
export declare class ProjectsController {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
    createProject(createProjectDto: CreateProjectDto, userId: string): Promise<{
        id: string;
        name: string;
        description: string;
        status: import("./dto/project.dto").ProjectStatus;
        visibility: import("./dto/project.dto").ProjectVisibility;
        tags: string[];
        startDate: string;
        endDate: string;
        createdAt: string;
        updatedAt: string;
        ownerId: string;
    }>;
    getProjects(userId: string): Promise<any[]>;
    getProjectById(id: string, userId: string): Promise<any>;
    updateProject(id: string, updateProjectDto: UpdateProjectDto, userId: string): Promise<any>;
    deleteProject(id: string, userId: string): Promise<{
        message: string;
        project: any;
    }>;
    archiveProject(id: string, userId: string): Promise<any>;
    getProjectTags(id: string, userId: string): Promise<{
        tags: any;
    }>;
    addProjectTag(id: string, tagDto: AddProjectTagDto, userId: string): Promise<{
        message: string;
        tags: any;
    }>;
    removeProjectTag(id: string, tagDto: RemoveProjectTagDto, userId: string): Promise<{
        message: string;
        tags: any;
    }>;
    updateProjectTags(id: string, tagsDto: ProjectTagsDto, userId: string): Promise<{
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
    uploadProjectFile(projectId: string, fileUploadDto: FileUploadDto, userId: string): Promise<any>;
    downloadProjectFile(projectId: string, fileId: string, userId: string): Promise<import("./dto/project-features.dto").FileDownloadResponseDto>;
    moveProjectFile(projectId: string, fileId: string, moveFileDto: MoveFileDto, userId: string): Promise<any>;
    updateProjectFile(projectId: string, fileId: string, updateDto: UpdateFileDto, userId: string): Promise<any>;
    deleteProjectFile(projectId: string, fileId: string, userId: string): Promise<{
        message: string;
        file: any;
    }>;
    getProjectActivities(id: string, userId: string, limit?: number): Promise<any[]>;
    getFilesByType(projectId: string, fileType: FileType, userId: string): Promise<any[]>;
    getFilesByFormat(projectId: string, format: FileFormat, userId: string): Promise<any[]>;
    getFilePermissions(projectId: string, fileId: string, userId: string): Promise<any>;
    updateFilePermissions(projectId: string, fileId: string, permissionsDto: UpdateFilePermissionsDto, userId: string): Promise<any>;
    shareFileWithUser(projectId: string, fileId: string, shareDto: ShareFileWithUserDto, userId: string): Promise<any>;
    shareFileWithEmail(projectId: string, fileId: string, shareDto: ShareFileWithEmailDto, userId: string): Promise<any>;
    generateShareLink(projectId: string, fileId: string, shareLinkDto: GenerateShareLinkDto, userId: string): Promise<import("./dto/project-features.dto").ShareLinkResponseDto>;
    accessSharedFile(token: string, password?: string): Promise<any>;
    updateFileSizeLimit(limitDto: FileSizeLimitDto): Promise<any>;
}
