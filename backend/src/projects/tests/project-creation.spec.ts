import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from '../projects.service';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { ProjectStatus, ProjectVisibility } from '../dto/project.dto';

describe('ProjectsService - Project Creation', () => {
  let service: ProjectsService;
  let userId: string;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectsService],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
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
      expect(result.status).toBe(ProjectStatus.ACTIVE); // Default status
      expect(result.visibility).toBe(ProjectVisibility.PRIVATE); // Default visibility
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
      expect(result.description).toBe(''); // Default empty description
      expect(result.tags).toEqual([]); // Default empty tags array
      expect(result.status).toBe(ProjectStatus.ACTIVE); // Default status
      expect(result.visibility).toBe(ProjectVisibility.PRIVATE); // Default visibility
      expect(result.ownerId).toBe(userId);
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });
    
    it('should create a project with custom status and visibility', async () => {
      const projectData = {
        name: 'Custom Project',
        status: ProjectStatus.ON_HOLD,
        visibility: ProjectVisibility.TEAM
      };
      
      const result = await service.createProject(projectData, userId);
      
      expect(result).toBeDefined();
      expect(result.name).toBe(projectData.name);
      expect(result.status).toBe(ProjectStatus.ON_HOLD);
      expect(result.visibility).toBe(ProjectVisibility.TEAM);
    });
    
    it('should throw error when creating a project with invalid data (missing name)', async () => {
      const projectData = {
        description: 'A project without a name'
      };
      
      await expect(
        service.createProject(projectData as any, userId)
      ).rejects.toThrow(BadRequestException);
    });
    
    it('should throw error when creating a project with invalid dates (end before start)', async () => {
      const projectData = {
        name: 'Invalid Dates Project',
        startDate: '2023-12-31',
        endDate: '2023-01-01'
      };
      
      await expect(
        service.createProject(projectData, userId)
      ).rejects.toThrow(BadRequestException);
    });
    
    it('should throw error when creating a project with invalid date format', async () => {
      const projectData = {
        name: 'Invalid Date Format Project',
        startDate: 'not-a-date',
        endDate: '2023-12-31'
      };
      
      await expect(
        service.createProject(projectData, userId)
      ).rejects.toThrow(BadRequestException);
    });
    
    it('should throw error when creating a project with duplicate name', async () => {
      const projectData = {
        name: 'Duplicate Project'
      };
      
      // Create first project
      await service.createProject(projectData, userId);
      
      // Attempt to create second project with same name
      await expect(
        service.createProject(projectData, userId)
      ).rejects.toThrow(ConflictException);
    });
    
    it('should allow different users to create projects with the same name', async () => {
      const projectData = {
        name: 'Same Name Project'
      };
      
      const otherUserId = 'other-user-id';
      
      // Create project for first user
      const result1 = await service.createProject(projectData, userId);
      
      // Create project with same name for second user
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
      
      await expect(
        service.createProject(projectData, userId)
      ).rejects.toThrow(BadRequestException);
    });
  });
}); 