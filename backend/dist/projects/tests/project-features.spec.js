"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const projects_service_1 = require("../projects.service");
const common_1 = require("@nestjs/common");
const project_dto_1 = require("../dto/project.dto");
const project_features_dto_1 = require("../dto/project-features.dto");
describe('ProjectsService - Project Features', () => {
    let service;
    let userId;
    let projectId;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [projects_service_1.ProjectsService],
        }).compile();
        service = module.get(projects_service_1.ProjectsService);
        userId = 'test-user-id';
        const project = await service.createProject({
            name: 'Test Project',
            description: 'A project for testing features',
            tags: ['initial-tag'],
            status: project_dto_1.ProjectStatus.ACTIVE,
            visibility: project_dto_1.ProjectVisibility.PRIVATE
        }, userId);
        projectId = project.id;
    });
    describe('Project Tags Management', () => {
        it('should retrieve project tags', async () => {
            const result = await service.getProjectTags(projectId, userId);
            expect(result).toBeDefined();
            expect(result.tags).toBeInstanceOf(Array);
            expect(result.tags).toContain('initial-tag');
        });
        it('should add a tag to a project', async () => {
            const result = await service.addProjectTag(projectId, { tag: 'new-tag' }, userId);
            expect(result).toBeDefined();
            expect(result.message).toBe('Tag added successfully');
            expect(result.tags).toContain('initial-tag');
            expect(result.tags).toContain('new-tag');
            const tags = await service.getProjectTags(projectId, userId);
            expect(tags.tags).toContain('new-tag');
        });
        it('should prevent adding duplicate tags', async () => {
            await expect(service.addProjectTag(projectId, { tag: 'initial-tag' }, userId)).rejects.toThrow(common_1.ConflictException);
        });
        it('should remove a tag from a project', async () => {
            const result = await service.removeProjectTag(projectId, { tag: 'initial-tag' }, userId);
            expect(result).toBeDefined();
            expect(result.message).toBe('Tag removed successfully');
            expect(result.tags).not.toContain('initial-tag');
            const tags = await service.getProjectTags(projectId, userId);
            expect(tags.tags).not.toContain('initial-tag');
        });
        it('should throw error when removing non-existent tag', async () => {
            await expect(service.removeProjectTag(projectId, { tag: 'non-existent-tag' }, userId)).rejects.toThrow(common_1.NotFoundException);
        });
        it('should update all project tags at once', async () => {
            const newTags = ['tag1', 'tag2', 'tag3'];
            const result = await service.updateProjectTags(projectId, { tags: newTags }, userId);
            expect(result).toBeDefined();
            expect(result.message).toBe('Tags updated successfully');
            expect(result.tags).toEqual(newTags);
            expect(result.tags).not.toContain('initial-tag');
            const tags = await service.getProjectTags(projectId, userId);
            expect(tags.tags).toEqual(newTags);
        });
    });
    describe('Project Files Management', () => {
        it('should add a file to a project', async () => {
            const fileDto = {
                name: 'test-document.pdf',
                path: '/uploads/test-document.pdf',
                type: project_features_dto_1.FileType.DOCUMENT,
                size: 1024,
                description: 'Test document'
            };
            const result = await service.addProjectFile(projectId, fileDto, userId);
            expect(result).toBeDefined();
            expect(result.id).toBeDefined();
            expect(result.projectId).toBe(projectId);
            expect(result.name).toBe(fileDto.name);
            expect(result.path).toBe(fileDto.path);
            expect(result.type).toBe(fileDto.type);
            expect(result.size).toBe(fileDto.size);
            expect(result.description).toBe(fileDto.description);
            expect(result.uploadedBy).toBe(userId);
            expect(result.uploadedAt).toBeDefined();
            expect(result.updatedAt).toBeDefined();
        });
        it('should retrieve project files', async () => {
            const fileDto = {
                name: 'test-image.jpg',
                path: '/uploads/test-image.jpg',
                type: project_features_dto_1.FileType.IMAGE,
                size: 2048
            };
            await service.addProjectFile(projectId, fileDto, userId);
            const files = await service.getProjectFiles(projectId, userId);
            expect(files).toBeDefined();
            expect(Array.isArray(files)).toBe(true);
            expect(files.length).toBe(1);
            expect(files[0].name).toBe(fileDto.name);
            expect(files[0].type).toBe(fileDto.type);
        });
        it('should retrieve a specific file by ID', async () => {
            const fileDto = {
                name: 'test-video.mp4',
                path: '/uploads/test-video.mp4',
                type: project_features_dto_1.FileType.VIDEO,
                size: 5120
            };
            const addedFile = await service.addProjectFile(projectId, fileDto, userId);
            const file = await service.getProjectFile(projectId, addedFile.id, userId);
            expect(file).toBeDefined();
            expect(file.id).toBe(addedFile.id);
            expect(file.name).toBe(fileDto.name);
        });
        it('should throw error when retrieving non-existent file', async () => {
            await expect(service.getProjectFile(projectId, 'non-existent-id', userId)).rejects.toThrow(common_1.NotFoundException);
        });
        it('should update file metadata', async () => {
            const fileDto = {
                name: 'original-name.txt',
                path: '/uploads/original-name.txt',
                type: project_features_dto_1.FileType.DOCUMENT,
                size: 512
            };
            const addedFile = await service.addProjectFile(projectId, fileDto, userId);
            const updateDto = {
                name: 'updated-name.txt',
                description: 'Added description'
            };
            const updatedFile = await service.updateProjectFile(projectId, addedFile.id, updateDto, userId);
            expect(updatedFile).toBeDefined();
            expect(updatedFile.id).toBe(addedFile.id);
            expect(updatedFile.name).toBe(updateDto.name);
            expect(updatedFile.description).toBe(updateDto.description);
            expect(updatedFile.path).toBe(fileDto.path);
            expect(updatedFile.type).toBe(fileDto.type);
            expect(updatedFile.size).toBe(fileDto.size);
        });
        it('should delete a file', async () => {
            const fileDto = {
                name: 'delete-me.txt',
                path: '/uploads/delete-me.txt',
                type: project_features_dto_1.FileType.DOCUMENT,
                size: 256
            };
            const addedFile = await service.addProjectFile(projectId, fileDto, userId);
            const result = await service.deleteProjectFile(projectId, addedFile.id, userId);
            expect(result).toBeDefined();
            expect(result.message).toBe('File deleted successfully');
            expect(result.file.id).toBe(addedFile.id);
            await expect(service.getProjectFile(projectId, addedFile.id, userId)).rejects.toThrow(common_1.NotFoundException);
        });
    });
    describe('Project Activity Tracking', () => {
        it('should track project creation activity', async () => {
            const activities = await service.getProjectActivities(projectId, userId);
            expect(activities).toBeDefined();
            expect(Array.isArray(activities)).toBe(true);
            expect(activities.length).toBeGreaterThan(0);
            const creationActivity = activities.find(a => a.type === project_features_dto_1.ActivityType.CREATED);
            expect(creationActivity).toBeDefined();
            expect(creationActivity.projectId).toBe(projectId);
            expect(creationActivity.userId).toBe(userId);
            expect(creationActivity.details.projectName).toBe('Test Project');
        });
        it('should track project update activity', async () => {
            await service.updateProject(projectId, { name: 'Updated Project Name' }, userId);
            const activities = await service.getProjectActivities(projectId, userId);
            const updateActivity = activities.find(a => a.type === project_features_dto_1.ActivityType.UPDATED && a.details.changedFields.includes('name'));
            expect(updateActivity).toBeDefined();
            expect(updateActivity.projectId).toBe(projectId);
            expect(updateActivity.userId).toBe(userId);
            expect(updateActivity.details.newValues.name).toBe('Updated Project Name');
        });
        it('should track tag activities', async () => {
            await service.addProjectTag(projectId, { tag: 'activity-test-tag' }, userId);
            await service.removeProjectTag(projectId, { tag: 'initial-tag' }, userId);
            const activities = await service.getProjectActivities(projectId, userId);
            const addTagActivity = activities.find(a => a.type === project_features_dto_1.ActivityType.TAG_ADDED);
            expect(addTagActivity).toBeDefined();
            expect(addTagActivity.projectId).toBe(projectId);
            expect(addTagActivity.userId).toBe(userId);
            expect(addTagActivity.details.tag).toBe('activity-test-tag');
            const removeTagActivity = activities.find(a => a.type === project_features_dto_1.ActivityType.TAG_REMOVED);
            expect(removeTagActivity).toBeDefined();
            expect(removeTagActivity.projectId).toBe(projectId);
            expect(removeTagActivity.userId).toBe(userId);
            expect(removeTagActivity.details.tag).toBe('initial-tag');
        });
        it('should track file activities', async () => {
            const fileDto = {
                name: 'activity-test.txt',
                path: '/uploads/activity-test.txt',
                type: project_features_dto_1.FileType.DOCUMENT,
                size: 100
            };
            const addedFile = await service.addProjectFile(projectId, fileDto, userId);
            await service.updateProjectFile(projectId, addedFile.id, { name: 'updated-activity-test.txt' }, userId);
            await service.deleteProjectFile(projectId, addedFile.id, userId);
            const activities = await service.getProjectActivities(projectId, userId);
            const addFileActivity = activities.find(a => a.type === project_features_dto_1.ActivityType.FILE_ADDED);
            expect(addFileActivity).toBeDefined();
            expect(addFileActivity.projectId).toBe(projectId);
            expect(addFileActivity.userId).toBe(userId);
            expect(addFileActivity.details.fileName).toBe('activity-test.txt');
            const updateFileActivity = activities.find(a => a.type === project_features_dto_1.ActivityType.FILE_UPDATED);
            expect(updateFileActivity).toBeDefined();
            expect(updateFileActivity.projectId).toBe(projectId);
            expect(updateFileActivity.userId).toBe(userId);
            expect(updateFileActivity.details.fileId).toBe(addedFile.id);
            const deleteFileActivity = activities.find(a => a.type === project_features_dto_1.ActivityType.FILE_DELETED);
            expect(deleteFileActivity).toBeDefined();
            expect(deleteFileActivity.projectId).toBe(projectId);
            expect(deleteFileActivity.userId).toBe(userId);
            expect(deleteFileActivity.details.fileId).toBe(addedFile.id);
        });
        it('should limit number of activities returned', async () => {
            await service.updateProject(projectId, { name: 'Name 1' }, userId);
            await service.updateProject(projectId, { name: 'Name 2' }, userId);
            await service.updateProject(projectId, { name: 'Name 3' }, userId);
            const activities = await service.getProjectActivities(projectId, userId, 2);
            expect(activities).toBeDefined();
            expect(activities.length).toBe(2);
            expect(new Date(activities[0].timestamp).getTime()).toBeGreaterThanOrEqual(new Date(activities[1].timestamp).getTime());
        });
    });
});
//# sourceMappingURL=project-features.spec.js.map