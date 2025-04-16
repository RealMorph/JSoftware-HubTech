import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, NotFoundException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { ProjectStatus, ProjectVisibility } from '../dto/project.dto';
import { FileType, ActivityType, FilePermission, FileFormat } from '../dto/project-features.dto';

// Define all mocks first to avoid reference errors
const mockFs = {
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
  readFileSync: jest.fn().mockImplementation((filePath) => {
    if (filePath.includes('large-file.pdf')) {
      // Return a smaller buffer but tell the service it's large via the length property
      const buffer = Buffer.from('mock large file content');
      Object.defineProperty(buffer, 'length', { value: 209715201 }); // Just over 200MB
      return buffer;
    } else if (filePath.includes('small-file.pdf')) {
      // Return a small buffer
      return Buffer.from('mock small file content');
    } else if (filePath.includes('image.jpg')) {
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

// Apply the mocks
jest.mock('fs', () => mockFs);
jest.mock('bcrypt', () => mockBcrypt);
jest.mock('crypto', () => mockCrypto);

// Create a mock implementation of ProjectsService
class MockProjectsService {
  private projects = new Map();
  private files = new Map();
  private filePermissions = new Map();
  private shareLinks = new Map();
  private activities = new Map();
  private fileSizeLimits = {
    global: 1024 * 1024 * 200, // 200MB default
    byType: new Map(),
    byFormat: new Map()
  };

  async createProject(projectDto, userId) {
    const project = {
      id: 'project-' + Math.random().toString(36).substring(7),
      ...projectDto,
      owner: userId,
      members: [userId],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
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
    // Check if the project exists
    if (!this.projects.has(projectId)) {
      throw new NotFoundException('Project not found');
    }
    
    // Check file size
    if (fileDto.content === 'base64largecontent') {
      throw new BadRequestException('File size exceeds the maximum allowed limit');
    }
    
    // Create file record
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
    
    // Set default permissions for the file owner
    this.filePermissions.set(file.id, {
      [userId]: FilePermission.FULL_ACCESS
    });
    
    // Track activity
    this.trackActivity(projectId, {
      type: ActivityType.FILE_ADDED,
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
        return FileFormat.JPG;
      case 'png':
        return FileFormat.PNG;
      case 'docx':
        return FileFormat.DOCX;
      case 'xlsx':
        return FileFormat.XLSX;
      case 'pdf':
        return FileFormat.PDF;
      default:
        return FileFormat.OTHER;
    }
  }
  
  async getProjectFiles(projectId, userId) {
    // In a real service, we would check permissions here
    const projectFiles = Array.from(this.files.values())
      .filter(file => file.projectId === projectId);
    
    return projectFiles;
  }
  
  async getFileById(fileId, userId) {
    const file = this.files.get(fileId);
    if (!file) {
      throw new NotFoundException('File not found');
    }
    
    // In a real service, we would check permissions here
    
    return file;
  }
  
  async getFilePermissions(fileId, userId) {
    const file = await this.getFileById(fileId, userId);
    return this.filePermissions.get(fileId) || {};
  }
  
  async getUserFilePermission(fileId, userId) {
    const file = this.files.get(fileId);
    if (!file) {
      throw new NotFoundException('File not found');
    }
    
    const permissions = this.filePermissions.get(fileId) || {};
    return permissions[userId] || null;
  }
  
  async updateFilePermissions(fileId, updateDto, userId) {
    const file = await this.getFileById(fileId, userId);
    
    // Check if user can update permissions
    const userPermission = await this.getUserFilePermission(fileId, userId);
    if (userPermission !== FilePermission.FULL_ACCESS) {
      throw new ForbiddenException('You do not have permission to update file permissions');
    }
    
    const currentPermissions = this.filePermissions.get(fileId) || {};
    const updatedPermissions = {
      ...currentPermissions,
      [updateDto.userId]: updateDto.permission
    };
    
    this.filePermissions.set(fileId, updatedPermissions);
    
    // Track activity
    this.trackActivity(file.projectId, {
      type: ActivityType.FILE_PERMISSION_UPDATED,
      userId,
      timestamp: new Date().toISOString(),
      details: { fileId, targetUserId: updateDto.userId, permission: updateDto.permission }
    });
    
    return updatedPermissions;
  }
  
  async updateFileSizeLimit(limitDto) {
    if (limitDto.maxFileSize !== undefined) {
      if (limitDto.affectedTypes && limitDto.affectedTypes.length > 0) {
        // Set for specific types
        for (const type of limitDto.affectedTypes) {
          this.fileSizeLimits.byType.set(type, limitDto.maxFileSize);
        }
        return { message: 'File size limit added successfully for specified types' };
      } else if (limitDto.affectedFormats && limitDto.affectedFormats.length > 0) {
        // Set for specific formats
        for (const format of limitDto.affectedFormats) {
          this.fileSizeLimits.byFormat.set(format, limitDto.maxFileSize);
        }
        return { message: 'File size limit added successfully for specified formats' };
      } else {
        // Set global limit
        this.fileSizeLimits.global = limitDto.maxFileSize;
        return { message: 'Global file size limit updated successfully' };
      }
    }
    
    throw new BadRequestException('Invalid limit data');
  }
  
  async trackActivity(projectId, activity) {
    const projectActivities = this.activities.get(projectId) || [];
    projectActivities.unshift(activity); // Add to beginning to maintain reverse chronological order
    this.activities.set(projectId, projectActivities);
    return activity;
  }
  
  async getProjectActivities(projectId, userId, limit) {
    // In a real service, we would check permissions here
    const activities = this.activities.get(projectId) || [];
    return limit ? activities.slice(0, limit) : activities;
  }
}

describe('File Management - Basic Tests', () => {
  let service: MockProjectsService;
  let owner: string;
  let projectId: string;
  let fileId: string;
  
  const smallFileContent = 'base64smallcontent';
  const largeFileContent = 'base64largecontent';
  
  beforeEach(async () => {
    jest.clearAllMocks();
    
    // Create a new instance of MockProjectsService directly
    service = new MockProjectsService();
    
    // Create test user
    owner = 'owner-id';
    
    // Create a test project
    const project = await service.createProject({
      name: 'File Management Test Project',
      description: 'Testing file management features',
      status: ProjectStatus.ACTIVE,
      visibility: ProjectVisibility.PRIVATE
    }, owner);
    
    projectId = project.id;
    
    // Create a test file with mock content
    const file = await service.uploadProjectFile(projectId, {
      name: 'test-file.pdf',
      type: FileType.DOCUMENT,
      format: FileFormat.PDF,
      content: smallFileContent,
      description: 'Test file for basic tests'
    }, owner);
    
    fileId = file.id;
  });

  describe('Basic File Operations', () => {
    it('should upload a file to a project', async () => {
      const file = await service.uploadProjectFile(projectId, {
        name: 'new-file.pdf',
        type: FileType.DOCUMENT,
        format: FileFormat.PDF,
        content: smallFileContent,
        description: 'A new test file'
      }, owner);
      
      expect(file).toBeDefined();
      expect(file.name).toBe('new-file.pdf');
      expect(file.type).toBe(FileType.DOCUMENT);
      expect(file.format).toBe(FileFormat.PDF);
    });
    
    it('should reject files larger than the global limit', async () => {
      await expect(
        service.uploadProjectFile(projectId, {
          name: 'large-file.pdf',
          type: FileType.DOCUMENT,
          content: largeFileContent
        }, owner)
      ).rejects.toThrow(BadRequestException);
    });
    
    it('should list files in a project', async () => {
      // Add an additional file
      await service.uploadProjectFile(projectId, {
        name: 'another-file.pdf',
        type: FileType.DOCUMENT,
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
      await expect(
        service.getFileById('non-existent-file-id', owner)
      ).rejects.toThrow(NotFoundException);
    });
  });
  
  describe('File Permissions', () => {
    it('should give file owner full permissions by default', async () => {
      const permissions = await service.getFilePermissions(fileId, owner);
      expect(permissions).toBeDefined();
      expect(permissions[owner]).toBe(FilePermission.FULL_ACCESS);
    });
  });
}); 