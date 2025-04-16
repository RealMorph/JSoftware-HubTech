"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const projects_service_1 = require("../projects.service");
const common_1 = require("@nestjs/common");
const project_dto_1 = require("../dto/project.dto");
describe('ProjectsService - Project Management', () => {
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
            description: 'A project for testing management functions',
            tags: ['test', 'management'],
            status: project_dto_1.ProjectStatus.ACTIVE,
            visibility: project_dto_1.ProjectVisibility.PRIVATE
        }, userId);
        projectId = project.id;
    });
    describe('Get Projects', () => {
        it('should retrieve all projects for a user', async () => {
            await service.createProject({ name: 'Second Project' }, userId);
            await service.createProject({ name: 'Third Project' }, userId);
            const projects = await service.getProjects(userId);
            expect(projects).toBeDefined();
            expect(Array.isArray(projects)).toBe(true);
            expect(projects.length).toBe(3);
            expect(projects[0].name).toBe('Test Project');
            expect(projects[1].name).toBe('Second Project');
            expect(projects[2].name).toBe('Third Project');
        });
        it('should return empty array when user has no projects', async () => {
            const noProjectsUserId = 'user-with-no-projects';
            const projects = await service.getProjects(noProjectsUserId);
            expect(projects).toBeDefined();
            expect(Array.isArray(projects)).toBe(true);
            expect(projects.length).toBe(0);
        });
        it('should retrieve a specific project by ID', async () => {
            const project = await service.getProjectById(projectId, userId);
            expect(project).toBeDefined();
            expect(project.id).toBe(projectId);
            expect(project.name).toBe('Test Project');
            expect(project.ownerId).toBe(userId);
        });
        it('should throw error when requesting non-existent project', async () => {
            const nonExistentId = 'non-existent-id';
            await expect(service.getProjectById(nonExistentId, userId)).rejects.toThrow(common_1.NotFoundException);
        });
        it('should allow access to public projects by other users', async () => {
            const publicProject = await service.createProject({
                name: 'Public Project',
                visibility: project_dto_1.ProjectVisibility.PUBLIC
            }, userId);
            const otherUserId = 'other-user-id';
            const retrievedProject = await service.getProjectById(publicProject.id, otherUserId);
            expect(retrievedProject).toBeDefined();
            expect(retrievedProject.id).toBe(publicProject.id);
            expect(retrievedProject.name).toBe('Public Project');
        });
        it('should not allow access to private projects by other users', async () => {
            const otherUserId = 'other-user-id';
            await expect(service.getProjectById(projectId, otherUserId)).rejects.toThrow(common_1.NotFoundException);
        });
    });
    describe('Update Project', () => {
        it('should update a project successfully', async () => {
            const updateData = {
                name: 'Updated Project Name',
                description: 'Updated description',
                tags: ['updated', 'project'],
                status: project_dto_1.ProjectStatus.ON_HOLD
            };
            const updatedProject = await service.updateProject(projectId, updateData, userId);
            expect(updatedProject).toBeDefined();
            expect(updatedProject.id).toBe(projectId);
            expect(updatedProject.name).toBe(updateData.name);
            expect(updatedProject.description).toBe(updateData.description);
            expect(updatedProject.tags).toEqual(updateData.tags);
            expect(updatedProject.status).toBe(updateData.status);
            expect(updatedProject.updatedAt).toBeDefined();
        });
        it('should allow partial updates', async () => {
            const updateData = {
                description: 'Only update the description'
            };
            const updatedProject = await service.updateProject(projectId, updateData, userId);
            expect(updatedProject).toBeDefined();
            expect(updatedProject.id).toBe(projectId);
            expect(updatedProject.name).toBe('Test Project');
            expect(updatedProject.description).toBe(updateData.description);
        });
        it('should throw error when updating a non-existent project', async () => {
            const nonExistentId = 'non-existent-id';
            const updateData = { name: 'Updated Name' };
            await expect(service.updateProject(nonExistentId, updateData, userId)).rejects.toThrow(common_1.NotFoundException);
        });
        it('should throw error when updating to a duplicate name', async () => {
            await service.createProject({ name: 'Another Project' }, userId);
            const updateData = { name: 'Another Project' };
            await expect(service.updateProject(projectId, updateData, userId)).rejects.toThrow(common_1.ConflictException);
        });
        it('should throw error when updating to invalid dates', async () => {
            const updateData = {
                startDate: '2023-12-31',
                endDate: '2023-01-01'
            };
            await expect(service.updateProject(projectId, updateData, userId)).rejects.toThrow(common_1.BadRequestException);
        });
    });
    describe('Delete Project', () => {
        it('should delete a project successfully', async () => {
            const result = await service.deleteProject(projectId, userId);
            expect(result).toBeDefined();
            expect(result.message).toBe('Project deleted successfully');
            expect(result.project.id).toBe(projectId);
            await expect(service.getProjectById(projectId, userId)).rejects.toThrow(common_1.NotFoundException);
        });
        it('should throw error when deleting a non-existent project', async () => {
            const nonExistentId = 'non-existent-id';
            await expect(service.deleteProject(nonExistentId, userId)).rejects.toThrow(common_1.NotFoundException);
        });
        it('should not allow other users to delete a project', async () => {
            const otherUserId = 'other-user-id';
            await expect(service.deleteProject(projectId, otherUserId)).rejects.toThrow(common_1.NotFoundException);
        });
    });
    describe('Archive Project', () => {
        it('should archive a project successfully', async () => {
            const archivedProject = await service.archiveProject(projectId, userId);
            expect(archivedProject).toBeDefined();
            expect(archivedProject.id).toBe(projectId);
            expect(archivedProject.status).toBe(project_dto_1.ProjectStatus.ARCHIVED);
        });
        it('should throw error when archiving a non-existent project', async () => {
            const nonExistentId = 'non-existent-id';
            await expect(service.archiveProject(nonExistentId, userId)).rejects.toThrow(common_1.NotFoundException);
        });
        it('should not allow other users to archive a project', async () => {
            const otherUserId = 'other-user-id';
            await expect(service.archiveProject(projectId, otherUserId)).rejects.toThrow(common_1.NotFoundException);
        });
    });
});
//# sourceMappingURL=project-management.spec.js.map