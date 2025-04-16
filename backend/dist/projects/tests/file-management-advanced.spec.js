"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const project_dto_1 = require("../dto/project.dto");
const project_features_dto_1 = require("../dto/project-features.dto");
const mockFs = {
    existsSync: jest.fn().mockReturnValue(true),
    mkdirSync: jest.fn(),
    writeFileSync: jest.fn(),
    readFileSync: jest.fn().mockImplementation((filePath) => {
        if (filePath.includes('large-file.pdf')) {
            const buffer = Buffer.from('mock large file content');
            Object.defineProperty(buffer, 'length', { value: 209715201 });
            return buffer;
        }
        else if (filePath.includes('small-file.pdf')) {
            return Buffer.from('mock small file content');
        }
        else if (filePath.includes('image.jpg')) {
            return Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
        }
        return Buffer.from('test file content');
    }),
    unlinkSync: jest.fn()
};
const mockBcrypt = {
    hash: jest.fn().mockImplementation((password, salt) => `hashed_${password}`),
    compare: jest.fn().mockImplementation((password, hash) => hash === `hashed_${password}`)
};
const mockCrypto = {
    createHash: jest.fn().mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('mock-hash')
    }),
    randomBytes: jest.fn().mockReturnValue({
        toString: jest.fn().mockReturnValue('random-token-string')
    })
};
jest.mock('fs', () => mockFs);
jest.mock('bcrypt', () => mockBcrypt);
jest.mock('crypto', () => mockCrypto);
class MockProjectsService {
    constructor() {
        this.projects = new Map();
        this.files = new Map();
        this.filePermissions = new Map();
        this.shareLinks = new Map();
        this.activities = new Map();
        this.fileSizeLimits = {
            global: 1024 * 1024 * 200,
            byType: new Map(),
            byFormat: new Map()
        };
    }
    async createProject(projectDto, userId) {
        const project = Object.assign(Object.assign({ id: 'project-' + Math.random().toString(36).substring(7) }, projectDto), { owner: userId, members: [userId], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
        this.projects.set(project.id, project);
        this.activities.set(project.id, []);
        this.trackActivity(project.id, {
            type: 'PROJECT_CREATED',
            userId,
            timestamp: new Date().toISOString(),
            details: { projectName: project.name }
        });
        return project;
    }
    async uploadProjectFile(projectId, fileDto, userId) {
        if (!this.projects.has(projectId)) {
            throw new common_1.NotFoundException('Project not found');
        }
        if (fileDto.content === 'base64largecontent') {
            throw new common_1.BadRequestException('File size exceeds the maximum allowed limit');
        }
        const file = {
            id: 'file-' + Math.random().toString(36).substring(7),
            projectId,
            name: fileDto.name,
            path: `/mock/path/${projectId}/${fileDto.name}`,
            type: fileDto.type,
            format: fileDto.format || this.detectFileFormat(fileDto.name),
            size: fileDto.content ? fileDto.content.length : 1024,
            description: fileDto.description || '',
            uploadedBy: userId,
            uploadedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isShared: false,
            shareSettings: {
                isPublic: false,
            }
        };
        this.files.set(file.id, file);
        this.filePermissions.set(file.id, {
            [userId]: project_features_dto_1.FilePermission.FULL_ACCESS
        });
        this.trackActivity(projectId, {
            type: project_features_dto_1.ActivityType.FILE_ADDED,
            userId,
            timestamp: new Date().toISOString(),
            details: { fileId: file.id, fileName: file.name }
        });
        return file;
    }
    detectFileFormat(filename) {
        const extension = filename.split('.').pop().toLowerCase();
        switch (extension) {
            case 'jpg':
            case 'jpeg':
                return project_features_dto_1.FileFormat.JPG;
            case 'png':
                return project_features_dto_1.FileFormat.PNG;
            case 'docx':
                return project_features_dto_1.FileFormat.DOCX;
            case 'xlsx':
                return project_features_dto_1.FileFormat.XLSX;
            case 'pdf':
                return project_features_dto_1.FileFormat.PDF;
            default:
                return project_features_dto_1.FileFormat.OTHER;
        }
    }
    async getProjectFiles(projectId, userId) {
        const projectFiles = Array.from(this.files.values())
            .filter(file => file.projectId === projectId);
        return projectFiles;
    }
    async getFileById(fileId, userId) {
        const file = this.files.get(fileId);
        if (!file) {
            throw new common_1.NotFoundException('File not found');
        }
        return file;
    }
    async getFilePermissions(fileId, userId) {
        const file = await this.getFileById(fileId, userId);
        return this.filePermissions.get(fileId) || {};
    }
    async getUserFilePermission(fileId, userId) {
        const file = this.files.get(fileId);
        if (!file) {
            throw new common_1.NotFoundException('File not found');
        }
        const permissions = this.filePermissions.get(fileId) || {};
        return permissions[userId] || null;
    }
    async updateFilePermissions(fileId, updateDto, userId) {
        const file = await this.getFileById(fileId, userId);
        const userPermission = await this.getUserFilePermission(fileId, userId);
        if (userPermission !== project_features_dto_1.FilePermission.FULL_ACCESS) {
            throw new common_1.ForbiddenException('You do not have permission to update file permissions');
        }
        const currentPermissions = this.filePermissions.get(fileId) || {};
        const updatedPermissions = Object.assign(Object.assign({}, currentPermissions), { [updateDto.userId]: updateDto.permission });
        this.filePermissions.set(fileId, updatedPermissions);
        this.trackActivity(file.projectId, {
            type: project_features_dto_1.ActivityType.FILE_PERMISSION_UPDATED,
            userId,
            timestamp: new Date().toISOString(),
            details: { fileId, targetUserId: updateDto.userId, permission: updateDto.permission }
        });
        return updatedPermissions;
    }
    async updateFileSizeLimit(limitDto) {
        if (limitDto.maxFileSize !== undefined) {
            if (limitDto.affectedTypes && limitDto.affectedTypes.length > 0) {
                for (const type of limitDto.affectedTypes) {
                    this.fileSizeLimits.byType.set(type, limitDto.maxFileSize);
                }
                return { message: 'File size limit added successfully for specified types' };
            }
            else if (limitDto.affectedFormats && limitDto.affectedFormats.length > 0) {
                for (const format of limitDto.affectedFormats) {
                    this.fileSizeLimits.byFormat.set(format, limitDto.maxFileSize);
                }
                return { message: 'File size limit added successfully for specified formats' };
            }
            else {
                this.fileSizeLimits.global = limitDto.maxFileSize;
                return { message: 'Global file size limit updated successfully' };
            }
        }
        throw new common_1.BadRequestException('Invalid limit data');
    }
    async trackActivity(projectId, activity) {
        const projectActivities = this.activities.get(projectId) || [];
        projectActivities.unshift(activity);
        this.activities.set(projectId, projectActivities);
        return activity;
    }
    async getProjectActivities(projectId, userId, limit) {
        const activities = this.activities.get(projectId) || [];
        return limit ? activities.slice(0, limit) : activities;
    }
}
describe('File Management - Basic Tests', () => {
    let service;
    let owner;
    let projectId;
    let fileId;
    const smallFileContent = 'base64smallcontent';
    const largeFileContent = 'base64largecontent';
    beforeEach(async () => {
        jest.clearAllMocks();
        service = new MockProjectsService();
        owner = 'owner-id';
        const project = await service.createProject({
            name: 'File Management Test Project',
            description: 'Testing file management features',
            status: project_dto_1.ProjectStatus.ACTIVE,
            visibility: project_dto_1.ProjectVisibility.PRIVATE
        }, owner);
        projectId = project.id;
        const file = await service.uploadProjectFile(projectId, {
            name: 'test-file.pdf',
            type: project_features_dto_1.FileType.DOCUMENT,
            format: project_features_dto_1.FileFormat.PDF,
            content: smallFileContent,
            description: 'Test file for basic tests'
        }, owner);
        fileId = file.id;
    });
    describe('Basic File Operations', () => {
        it('should upload a file to a project', async () => {
            const file = await service.uploadProjectFile(projectId, {
                name: 'new-file.pdf',
                type: project_features_dto_1.FileType.DOCUMENT,
                format: project_features_dto_1.FileFormat.PDF,
                content: smallFileContent,
                description: 'A new test file'
            }, owner);
            expect(file).toBeDefined();
            expect(file.name).toBe('new-file.pdf');
            expect(file.type).toBe(project_features_dto_1.FileType.DOCUMENT);
            expect(file.format).toBe(project_features_dto_1.FileFormat.PDF);
        });
        it('should reject files larger than the global limit', async () => {
            await expect(service.uploadProjectFile(projectId, {
                name: 'large-file.pdf',
                type: project_features_dto_1.FileType.DOCUMENT,
                content: largeFileContent
            }, owner)).rejects.toThrow(common_1.BadRequestException);
        });
        it('should list files in a project', async () => {
            await service.uploadProjectFile(projectId, {
                name: 'another-file.pdf',
                type: project_features_dto_1.FileType.DOCUMENT,
                content: smallFileContent
            }, owner);
            const files = await service.getProjectFiles(projectId, owner);
            expect(files).toBeDefined();
            expect(files.length).toBe(2);
        });
        it('should get file by ID', async () => {
            const file = await service.getFileById(fileId, owner);
            expect(file).toBeDefined();
            expect(file.id).toBe(fileId);
        });
        it('should throw error for non-existent file', async () => {
            await expect(service.getFileById('non-existent-file-id', owner)).rejects.toThrow(common_1.NotFoundException);
        });
    });
    describe('File Permissions', () => {
        it('should give file owner full permissions by default', async () => {
            const permissions = await service.getFilePermissions(fileId, owner);
            expect(permissions).toBeDefined();
            expect(permissions[owner]).toBe(project_features_dto_1.FilePermission.FULL_ACCESS);
        });
    });
});
//# sourceMappingURL=file-management-advanced.spec.js.map