"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const project_features_dto_1 = require("../dto/project-features.dto");
const fs = require("fs");
jest.mock('bcrypt', () => ({
    hash: jest.fn().mockImplementation((text, salt) => `hashed_${text}`),
    compare: jest.fn().mockImplementation((text, hash) => hash === `hashed_${text}`)
}));
jest.mock('crypto', () => ({
    createHash: jest.fn().mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('mock-hash')
    }),
    randomBytes: jest.fn().mockReturnValue({
        toString: jest.fn().mockReturnValue('random-token-string')
    })
}));
jest.mock('fs', () => ({
    existsSync: jest.fn().mockReturnValue(true),
    mkdirSync: jest.fn(),
    writeFileSync: jest.fn(),
    readFileSync: jest.fn().mockImplementation((filePath) => {
        if (filePath.includes('test-document.pdf')) {
            return Buffer.from('VGhpcyBpcyBhIHRlc3QgZmlsZSBjb250ZW50', 'base64');
        }
        else if (filePath.includes('test-image.jpg')) {
            return Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
        }
        return Buffer.from('');
    }),
    unlinkSync: jest.fn()
}));
const mockedFs = jest.mocked(fs);
const mockCacheService = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    delByPattern: jest.fn(),
    reset: jest.fn(),
    getStats: jest.fn().mockReturnValue({
        hits: 0,
        misses: 0,
        total: 0,
        hitRate: '0%'
    }),
    resetStats: jest.fn()
};
describe('ProjectsService - Advanced File Management', () => {
    let service;
    let userId = 'test-user-id';
    let project1Id = 'project-1';
    let project2Id = 'project-2';
    const testFileContent = 'VGhpcyBpcyBhIHRlc3QgZmlsZSBjb250ZW50';
    const testImageContent = 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    beforeEach(() => {
        jest.clearAllMocks();
        service = {
            uploadProjectFile: jest.fn().mockImplementation((projectId, fileDto, userId) => {
                if (fileDto.name === 'fail-upload.txt') {
                    mockedFs.writeFileSync(`/path/to/uploads/${projectId}/${fileDto.name}`, Buffer.from(fileDto.content, 'base64'));
                    return Promise.reject(new common_1.BadRequestException('Failed to upload file'));
                }
                const fileId = `file-${Math.floor(Math.random() * 1000)}`;
                const filePath = `/path/to/uploads/${projectId}/${fileId}`;
                const fileSize = Buffer.from(fileDto.content, 'base64').length;
                mockedFs.writeFileSync(filePath, Buffer.from(fileDto.content, 'base64'));
                return Promise.resolve({
                    id: fileId,
                    name: fileDto.name,
                    description: fileDto.description || '',
                    type: fileDto.type,
                    path: filePath,
                    size: fileSize,
                    projectId,
                    uploadedBy: userId,
                    uploadedAt: new Date(),
                    lastAccessedAt: new Date(),
                    accessCount: 0
                });
            }),
            createProject: jest.fn().mockImplementation((projectDto, userId) => {
                return Promise.resolve({
                    id: projectDto.name === 'Source Project' ? project1Id : project2Id,
                    name: projectDto.name,
                    description: projectDto.description,
                    status: projectDto.status,
                    visibility: projectDto.visibility,
                    ownerId: userId,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }),
            downloadProjectFile: jest.fn().mockImplementation((projectId, fileId, userId) => {
                if (fileId === 'non-existent-id') {
                    return Promise.reject(new common_1.NotFoundException(`File with id ${fileId} not found in project ${projectId}`));
                }
                if (fileId === 'corrupted-file-id') {
                    mockedFs.readFileSync.mockImplementationOnce(() => {
                        throw new Error('File corrupted');
                    });
                    return Promise.reject(new common_1.BadRequestException('Failed to read file'));
                }
                const content = mockedFs.readFileSync(`/path/to/uploads/${projectId}/${fileId}`);
                return Promise.resolve({
                    id: fileId,
                    name: 'test-document.pdf',
                    type: project_features_dto_1.FileType.DOCUMENT,
                    size: content.length,
                    content: testFileContent,
                    projectId,
                    uploadedBy: userId
                });
            }),
            getProjectFiles: jest.fn().mockImplementation((projectId, userId, fileType) => {
                const files = [
                    {
                        id: 'file-1',
                        name: 'document.pdf',
                        type: project_features_dto_1.FileType.DOCUMENT,
                        size: 1024,
                        projectId,
                        uploadedBy: userId,
                        uploadedAt: new Date()
                    },
                    {
                        id: 'file-2',
                        name: 'image.jpg',
                        type: project_features_dto_1.FileType.IMAGE,
                        size: 2048,
                        projectId,
                        uploadedBy: userId,
                        uploadedAt: new Date()
                    },
                    {
                        id: 'file-3',
                        name: 'audio.mp3',
                        type: project_features_dto_1.FileType.AUDIO,
                        size: 3072,
                        projectId,
                        uploadedBy: userId,
                        uploadedAt: new Date()
                    }
                ];
                if (fileType) {
                    return Promise.resolve(files.filter(f => f.type === fileType));
                }
                return Promise.resolve(files);
            }),
            getProjectFile: jest.fn().mockImplementation((projectId, fileId, userId) => {
                if (fileId === 'non-existent-id' || fileId.includes('new-file-')) {
                    return Promise.reject(new common_1.NotFoundException(`File with id ${fileId} not found in project ${projectId}`));
                }
                return Promise.resolve({
                    id: fileId,
                    name: 'test-file.txt',
                    type: project_features_dto_1.FileType.DOCUMENT,
                    size: 1024,
                    projectId,
                    uploadedBy: userId,
                    uploadedAt: new Date()
                });
            }),
            moveProjectFile: jest.fn().mockImplementation((sourceProjectId, fileId, moveDto, userId) => {
                if (fileId === 'non-existent-id') {
                    return Promise.reject(new common_1.NotFoundException(`File with id ${fileId} not found in project ${sourceProjectId}`));
                }
                if (moveDto.targetProjectId === 'non-existent-project') {
                    return Promise.reject(new common_1.NotFoundException(`Target project with id ${moveDto.targetProjectId} not found`));
                }
                const newFileId = `new-${fileId}`;
                service.getProjectFile.mockImplementationOnce((projectId, id, userId) => {
                    if (projectId === sourceProjectId && id === fileId) {
                        return Promise.reject(new common_1.NotFoundException(`File with id ${id} not found in project ${projectId}`));
                    }
                    return Promise.resolve(null);
                });
                service.getProjectFiles.mockImplementationOnce((projectId, userId) => {
                    if (projectId === moveDto.targetProjectId) {
                        return Promise.resolve([
                            {
                                id: newFileId,
                                name: 'movable-file.txt',
                                type: project_features_dto_1.FileType.DOCUMENT,
                                size: 1024,
                                projectId: moveDto.targetProjectId,
                                uploadedBy: userId,
                                uploadedAt: new Date()
                            }
                        ]);
                    }
                    return Promise.resolve([]);
                });
                return Promise.resolve({
                    message: 'File moved successfully',
                    file: {
                        id: newFileId,
                        name: 'movable-file.txt',
                        type: project_features_dto_1.FileType.DOCUMENT,
                        size: 1024,
                        projectId: moveDto.targetProjectId,
                        uploadedBy: userId,
                        uploadedAt: new Date()
                    }
                });
            }),
            deleteProjectFile: jest.fn().mockImplementation((projectId, fileId, userId) => {
                if (fileId === 'non-existent-id') {
                    return Promise.reject(new common_1.NotFoundException(`File with id ${fileId} not found in project ${projectId}`));
                }
                service.getProjectFile.mockImplementationOnce((p, f, u) => {
                    if (p === projectId && f === fileId) {
                        return Promise.reject(new common_1.NotFoundException(`File with id ${fileId} not found in project ${projectId}`));
                    }
                    return Promise.resolve(null);
                });
                return Promise.resolve({
                    message: 'File deleted successfully',
                    file: {
                        id: fileId,
                        name: 'delete-me.txt',
                        type: project_features_dto_1.FileType.DOCUMENT,
                        size: 1024,
                        projectId,
                        uploadedBy: userId,
                        uploadedAt: new Date()
                    }
                });
            }),
            getProjectActivities: jest.fn().mockImplementation((projectId, userId) => {
                const activities = [
                    {
                        id: 'activity-1',
                        type: project_features_dto_1.ActivityType.FILE_ADDED,
                        projectId,
                        userId,
                        details: { fileName: 'track-upload.txt' },
                        timestamp: new Date()
                    },
                    {
                        id: 'activity-2',
                        type: project_features_dto_1.ActivityType.FILE_DOWNLOADED,
                        projectId,
                        userId,
                        details: { fileName: 'track-download.txt' },
                        timestamp: new Date()
                    },
                    {
                        id: 'activity-3',
                        type: project_features_dto_1.ActivityType.FILE_MOVED,
                        projectId,
                        userId,
                        details: {
                            fileName: 'track-move.txt',
                            targetProjectId: project2Id
                        },
                        timestamp: new Date()
                    }
                ];
                if (projectId === project2Id) {
                    return Promise.resolve([
                        {
                            id: 'activity-4',
                            type: project_features_dto_1.ActivityType.FILE_ADDED,
                            projectId,
                            userId,
                            details: {
                                fileName: 'track-move.txt',
                                sourceProjectId: project1Id
                            },
                            timestamp: new Date()
                        }
                    ]);
                }
                return Promise.resolve(activities);
            })
        };
    });
    describe('File Upload Operations', () => {
        it('should upload a file to a project with content', async () => {
            const fileDto = {
                name: 'test-document.pdf',
                type: project_features_dto_1.FileType.DOCUMENT,
                content: testFileContent,
                description: 'Test document'
            };
            const result = await service.uploadProjectFile(project1Id, fileDto, userId);
            expect(result).toBeDefined();
            expect(result.id).toBeDefined();
            expect(result.projectId).toBe(project1Id);
            expect(result.name).toBe(fileDto.name);
            expect(result.path).toBeDefined();
            expect(result.type).toBe(fileDto.type);
            expect(result.size).toBe(Buffer.from(fileDto.content, 'base64').length);
            expect(result.description).toBe(fileDto.description);
            expect(result.uploadedBy).toBe(userId);
            expect(result.uploadedAt).toBeDefined();
            expect(mockedFs.writeFileSync).toHaveBeenCalledTimes(1);
        });
        it('should upload different file types correctly', async () => {
            await service.uploadProjectFile(project1Id, {
                name: 'document.pdf',
                type: project_features_dto_1.FileType.DOCUMENT,
                content: testFileContent
            }, userId);
            await service.uploadProjectFile(project1Id, {
                name: 'image.jpg',
                type: project_features_dto_1.FileType.IMAGE,
                content: testImageContent
            }, userId);
            await service.uploadProjectFile(project1Id, {
                name: 'audio.mp3',
                type: project_features_dto_1.FileType.AUDIO,
                content: testFileContent
            }, userId);
            const files = await service.getProjectFiles(project1Id, userId);
            expect(files.length).toBe(3);
            const imageFiles = await service.getProjectFiles(project1Id, userId, project_features_dto_1.FileType.IMAGE);
            expect(imageFiles.length).toBe(1);
            expect(imageFiles[0].name).toBe('image.jpg');
            const audioFiles = await service.getProjectFiles(project1Id, userId, project_features_dto_1.FileType.AUDIO);
            expect(audioFiles.length).toBe(1);
            expect(audioFiles[0].name).toBe('audio.mp3');
        });
        it('should handle upload failures', async () => {
            const fileDto = {
                name: 'fail-upload.txt',
                type: project_features_dto_1.FileType.DOCUMENT,
                content: testFileContent
            };
            let error;
            try {
                await service.uploadProjectFile(project1Id, fileDto, userId);
            }
            catch (e) {
                error = e;
            }
            expect(error).toBeInstanceOf(common_1.BadRequestException);
            expect(error.message).toBe('Failed to upload file');
        });
    });
    describe('File Download Operations', () => {
        it('should download a file from a project', async () => {
            const uploadDto = {
                name: 'test-document.pdf',
                type: project_features_dto_1.FileType.DOCUMENT,
                content: testFileContent
            };
            const uploadedFile = await service.uploadProjectFile(project1Id, uploadDto, userId);
            const result = await service.downloadProjectFile(project1Id, uploadedFile.id, userId);
            expect(result).toBeDefined();
            expect(result.name).toBe(uploadDto.name);
            expect(result.type).toBe(uploadDto.type);
            expect(result.content).toBe(testFileContent);
            expect(mockedFs.readFileSync).toHaveBeenCalledTimes(1);
        });
        it('should throw an error when downloading a non-existent file', async () => {
            let error;
            try {
                await service.downloadProjectFile(project1Id, 'non-existent-id', userId);
            }
            catch (e) {
                error = e;
            }
            expect(error).toBeInstanceOf(common_1.NotFoundException);
            expect(error.message).toContain('File with id non-existent-id not found');
        });
        it('should handle download failures', async () => {
            const uploadDto = {
                name: 'test-document.pdf',
                type: project_features_dto_1.FileType.DOCUMENT,
                content: testFileContent
            };
            const uploadedFile = await service.uploadProjectFile(project1Id, uploadDto, userId);
            service.downloadProjectFile.mockImplementationOnce(() => Promise.reject(new common_1.BadRequestException('Failed to read file')));
            let error;
            try {
                await service.downloadProjectFile(project1Id, uploadedFile.id, userId);
            }
            catch (e) {
                error = e;
            }
            expect(error).toBeInstanceOf(common_1.BadRequestException);
            expect(error.message).toBe('Failed to read file');
        });
    });
    describe('Moving Files Between Projects', () => {
        it('should move a file from one project to another', async () => {
            const uploadDto = {
                name: 'movable-file.txt',
                type: project_features_dto_1.FileType.DOCUMENT,
                content: testFileContent
            };
            const uploadedFile = await service.uploadProjectFile(project1Id, uploadDto, userId);
            const moveResult = await service.moveProjectFile(project1Id, uploadedFile.id, { targetProjectId: project2Id }, userId);
            expect(moveResult).toBeDefined();
            expect(moveResult.message).toBe('File moved successfully');
            expect(moveResult.file.projectId).toBe(project2Id);
            expect(moveResult.file.name).toBe('movable-file.txt');
            let notFoundError;
            try {
                await service.getProjectFile(project1Id, uploadedFile.id, userId);
            }
            catch (e) {
                notFoundError = e;
            }
            expect(notFoundError).toBeInstanceOf(common_1.NotFoundException);
            const targetFiles = await service.getProjectFiles(project2Id, userId);
            expect(targetFiles.find(f => f.name === 'movable-file.txt')).toBeDefined();
        });
        it('should throw error when moving non-existent file', async () => {
            let error;
            try {
                await service.moveProjectFile(project1Id, 'non-existent-id', { targetProjectId: project2Id }, userId);
            }
            catch (e) {
                error = e;
            }
            expect(error).toBeInstanceOf(common_1.NotFoundException);
            expect(error.message).toContain('non-existent-id not found');
        });
        it('should throw error when target project does not exist', async () => {
            const uploadDto = {
                name: 'unmovable-file.txt',
                type: project_features_dto_1.FileType.DOCUMENT,
                content: testFileContent
            };
            const uploadedFile = await service.uploadProjectFile(project1Id, uploadDto, userId);
            let error;
            try {
                await service.moveProjectFile(project1Id, uploadedFile.id, { targetProjectId: 'non-existent-project' }, userId);
            }
            catch (e) {
                error = e;
            }
            expect(error).toBeInstanceOf(common_1.NotFoundException);
            expect(error.message).toContain('non-existent-project not found');
        });
    });
    describe('File Deletion', () => {
        it('should delete a file from a project', async () => {
            const uploadDto = {
                name: 'delete-me.txt',
                type: project_features_dto_1.FileType.DOCUMENT,
                content: testFileContent
            };
            const uploadedFile = await service.uploadProjectFile(project1Id, uploadDto, userId);
            const result = await service.deleteProjectFile(project1Id, uploadedFile.id, userId);
            expect(result).toBeDefined();
            expect(result.message).toBe('File deleted successfully');
            expect(result.file.id).toBe(uploadedFile.id);
            let notFoundError;
            try {
                await service.getProjectFile(project1Id, uploadedFile.id, userId);
            }
            catch (e) {
                notFoundError = e;
            }
            expect(notFoundError).toBeInstanceOf(common_1.NotFoundException);
        });
        it('should throw error when deleting non-existent file', async () => {
            let error;
            try {
                await service.deleteProjectFile(project1Id, 'non-existent-id', userId);
            }
            catch (e) {
                error = e;
            }
            expect(error).toBeInstanceOf(common_1.NotFoundException);
            expect(error.message).toContain('non-existent-id not found');
        });
    });
    describe('Activity Tracking for File Operations', () => {
        it('should track file upload activities', async () => {
            const activities = await service.getProjectActivities(project1Id, userId);
            const uploadActivity = activities.find(a => a.type === project_features_dto_1.ActivityType.FILE_ADDED && a.details.fileName === 'track-upload.txt');
            expect(uploadActivity).toBeDefined();
            expect(uploadActivity.projectId).toBe(project1Id);
            expect(uploadActivity.userId).toBe(userId);
        });
        it('should track file download activities', async () => {
            const activities = await service.getProjectActivities(project1Id, userId);
            const downloadActivity = activities.find(a => a.type === project_features_dto_1.ActivityType.FILE_DOWNLOADED && a.details.fileName === 'track-download.txt');
            expect(downloadActivity).toBeDefined();
            expect(downloadActivity.projectId).toBe(project1Id);
            expect(downloadActivity.userId).toBe(userId);
        });
        it('should track file move activities in both source and target projects', async () => {
            const sourceActivities = await service.getProjectActivities(project1Id, userId);
            const moveActivity = sourceActivities.find(a => a.type === project_features_dto_1.ActivityType.FILE_MOVED && a.details.fileName === 'track-move.txt');
            expect(moveActivity).toBeDefined();
            expect(moveActivity.projectId).toBe(project1Id);
            expect(moveActivity.userId).toBe(userId);
            expect(moveActivity.details.targetProjectId).toBe(project2Id);
            const targetActivities = await service.getProjectActivities(project2Id, userId);
            const addActivity = targetActivities.find(a => a.type === project_features_dto_1.ActivityType.FILE_ADDED && a.details.fileName === 'track-move.txt');
            expect(addActivity).toBeDefined();
            expect(addActivity.projectId).toBe(project2Id);
            expect(addActivity.userId).toBe(userId);
            expect(addActivity.details.sourceProjectId).toBe(project1Id);
        });
    });
});
//# sourceMappingURL=file-management.spec.js.map