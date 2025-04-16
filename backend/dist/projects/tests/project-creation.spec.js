"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const projects_service_1 = require("../projects.service");
const common_1 = require("@nestjs/common");
const project_dto_1 = require("../dto/project.dto");
describe('ProjectsService - Project Creation', () => {
    let service;
    let userId;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [projects_service_1.ProjectsService],
        }).compile();
        service = module.get(projects_service_1.ProjectsService);
        userId = 'test-user-id';
    });
    describe('Project Creation', () => {
        it('should create a new project successfully', async () => {
            const projectData = {
                name: 'Test Project',
                description: 'A project for testing',
                tags: ['test', 'project'],
                startDate: '2023-01-01',
                endDate: '2023-12-31'
            };
            const result = await service.createProject(projectData, userId);
            expect(result).toBeDefined();
            expect(result.id).toBeDefined();
            expect(result.name).toBe(projectData.name);
            expect(result.description).toBe(projectData.description);
            expect(result.tags).toEqual(projectData.tags);
            expect(result.status).toBe(project_dto_1.ProjectStatus.ACTIVE);
            expect(result.visibility).toBe(project_dto_1.ProjectVisibility.PRIVATE);
            expect(result.ownerId).toBe(userId);
            expect(result.startDate).toBe(projectData.startDate);
            expect(result.endDate).toBe(projectData.endDate);
            expect(result.createdAt).toBeDefined();
            expect(result.updatedAt).toBeDefined();
        });
        it('should create a project with minimal data', async () => {
            const projectData = {
                name: 'Minimal Project'
            };
            const result = await service.createProject(projectData, userId);
            expect(result).toBeDefined();
            expect(result.id).toBeDefined();
            expect(result.name).toBe(projectData.name);
            expect(result.description).toBe('');
            expect(result.tags).toEqual([]);
            expect(result.status).toBe(project_dto_1.ProjectStatus.ACTIVE);
            expect(result.visibility).toBe(project_dto_1.ProjectVisibility.PRIVATE);
            expect(result.ownerId).toBe(userId);
            expect(result.createdAt).toBeDefined();
            expect(result.updatedAt).toBeDefined();
        });
        it('should create a project with custom status and visibility', async () => {
            const projectData = {
                name: 'Custom Project',
                status: project_dto_1.ProjectStatus.ON_HOLD,
                visibility: project_dto_1.ProjectVisibility.TEAM
            };
            const result = await service.createProject(projectData, userId);
            expect(result).toBeDefined();
            expect(result.name).toBe(projectData.name);
            expect(result.status).toBe(project_dto_1.ProjectStatus.ON_HOLD);
            expect(result.visibility).toBe(project_dto_1.ProjectVisibility.TEAM);
        });
        it('should throw error when creating a project with invalid data (missing name)', async () => {
            const projectData = {
                description: 'A project without a name'
            };
            await expect(service.createProject(projectData, userId)).rejects.toThrow(common_1.BadRequestException);
        });
        it('should throw error when creating a project with invalid dates (end before start)', async () => {
            const projectData = {
                name: 'Invalid Dates Project',
                startDate: '2023-12-31',
                endDate: '2023-01-01'
            };
            await expect(service.createProject(projectData, userId)).rejects.toThrow(common_1.BadRequestException);
        });
        it('should throw error when creating a project with invalid date format', async () => {
            const projectData = {
                name: 'Invalid Date Format Project',
                startDate: 'not-a-date',
                endDate: '2023-12-31'
            };
            await expect(service.createProject(projectData, userId)).rejects.toThrow(common_1.BadRequestException);
        });
        it('should throw error when creating a project with duplicate name', async () => {
            const projectData = {
                name: 'Duplicate Project'
            };
            await service.createProject(projectData, userId);
            await expect(service.createProject(projectData, userId)).rejects.toThrow(common_1.ConflictException);
        });
        it('should allow different users to create projects with the same name', async () => {
            const projectData = {
                name: 'Same Name Project'
            };
            const otherUserId = 'other-user-id';
            const result1 = await service.createProject(projectData, userId);
            const result2 = await service.createProject(projectData, otherUserId);
            expect(result1.id).not.toBe(result2.id);
            expect(result1.name).toBe(result2.name);
            expect(result1.ownerId).toBe(userId);
            expect(result2.ownerId).toBe(otherUserId);
        });
        it('should throw error when trying to create a project with empty name', async () => {
            const projectData = {
                name: '',
                description: 'A project with empty name'
            };
            await expect(service.createProject(projectData, userId)).rejects.toThrow(common_1.BadRequestException);
        });
    });
});
//# sourceMappingURL=project-creation.spec.js.map