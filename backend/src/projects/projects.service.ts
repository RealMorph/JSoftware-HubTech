import { Injectable, ConflictException, NotFoundException, BadRequestException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateProjectDto, UpdateProjectDto, ProjectStatus, ProjectVisibility } from './dto/project.dto';
import { 
  AddProjectTagDto, 
  RemoveProjectTagDto, 
  ProjectFileDto, 
  UpdateFileDto, 
  FileType, 
  ActivityType, 
  FileUploadDto, 
  MoveFileDto,
  FileDownloadResponseDto,
  FilePermission,
  FileFormat,
  FileSizeLimitDto,
  FileShareSettingsDto,
  UpdateFilePermissionsDto,
  ShareFileWithUserDto,
  ShareFileWithEmailDto,
  GenerateShareLinkDto,
  ShareLinkResponseDto
} from './dto/project-features.dto';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ProjectsService {
  private projects = [];
  private projectFiles = [];
  private projectActivities = [];
  private filePermissions = [];
  private shareLinks = [];
  private userShares = [];
  private emailShares = [];
  private uploadBasePath = './uploads'; // Base path for file uploads
  
  // File size limits in bytes
  private globalFileSizeLimit = 209715200; // 200 MB default
  private fileSizeLimits = []; // Custom limits by file type/format

  constructor() {
    // Ensure uploads directory exists
    if (!fs.existsSync(this.uploadBasePath)) {
      fs.mkdirSync(this.uploadBasePath, { recursive: true });
    }
  }

  async createProject(createProjectDto: CreateProjectDto, userId: string) {
    const { name, description, status, visibility, tags, startDate, endDate } = createProjectDto;

    // Validate required fields
    if (!name) {
      throw new BadRequestException('Project name is required');
    }

    // Check if project with the same name exists for this user
    const existingProject = this.projects.find(
      p => p.name === name && p.ownerId === userId
    );
    
    if (existingProject) {
      throw new ConflictException(`Project with name "${name}" already exists`);
    }

    // Validate dates if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (isNaN(start.getTime())) {
        throw new BadRequestException('Invalid start date format');
      }
      
      if (isNaN(end.getTime())) {
        throw new BadRequestException('Invalid end date format');
      }
      
      if (start > end) {
        throw new BadRequestException('Start date cannot be after end date');
      }
    }

    // Create new project
    const newProject = {
      id: uuidv4(),
      name,
      description: description || '',
      status: status || ProjectStatus.ACTIVE,
      visibility: visibility || ProjectVisibility.PRIVATE,
      tags: tags || [],
      startDate,
      endDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ownerId: userId
    };

    this.projects.push(newProject);
    
    // Track project creation activity
    this.trackActivity(newProject.id, userId, ActivityType.CREATED, {
      projectName: newProject.name
    });
    
    return newProject;
  }

  async getProjects(userId: string) {
    return this.projects.filter(project => project.ownerId === userId);
  }

  async getProjectById(projectId: string, userId: string) {
    const project = this.projects.find(
      p => p.id === projectId && (p.ownerId === userId || p.visibility === ProjectVisibility.PUBLIC)
    );
    
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    
    return project;
  }

  async updateProject(projectId: string, updateProjectDto: UpdateProjectDto, userId: string) {
    const projectIndex = this.projects.findIndex(p => p.id === projectId && p.ownerId === userId);
    
    if (projectIndex === -1) {
      throw new NotFoundException('Project not found');
    }
    
    const project = this.projects[projectIndex];
    
    // Check if name is being updated and if it's unique
    if (updateProjectDto.name && updateProjectDto.name !== project.name) {
      const existingProject = this.projects.find(
        p => p.name === updateProjectDto.name && p.ownerId === userId && p.id !== projectId
      );
      
      if (existingProject) {
        throw new ConflictException(`Project with name "${updateProjectDto.name}" already exists`);
      }
    }
    
    // Validate dates if both are provided in the update
    if (updateProjectDto.startDate && updateProjectDto.endDate) {
      const start = new Date(updateProjectDto.startDate);
      const end = new Date(updateProjectDto.endDate);
      
      if (isNaN(start.getTime())) {
        throw new BadRequestException('Invalid start date format');
      }
      
      if (isNaN(end.getTime())) {
        throw new BadRequestException('Invalid end date format');
      }
      
      if (start > end) {
        throw new BadRequestException('Start date cannot be after end date');
      }
    } else if (updateProjectDto.startDate && project.endDate) {
      // Only start date is being updated
      const start = new Date(updateProjectDto.startDate);
      const end = new Date(project.endDate);
      
      if (isNaN(start.getTime())) {
        throw new BadRequestException('Invalid start date format');
      }
      
      if (start > end) {
        throw new BadRequestException('Start date cannot be after end date');
      }
    } else if (updateProjectDto.endDate && project.startDate) {
      // Only end date is being updated
      const start = new Date(project.startDate);
      const end = new Date(updateProjectDto.endDate);
      
      if (isNaN(end.getTime())) {
        throw new BadRequestException('Invalid end date format');
      }
      
      if (start > end) {
        throw new BadRequestException('Start date cannot be after end date');
      }
    }
    
    // Track what's being updated
    const changedFields = Object.keys(updateProjectDto);
    
    // Update the project
    this.projects[projectIndex] = {
      ...project,
      ...updateProjectDto,
      updatedAt: new Date().toISOString()
    };
    
    // Track project update activity
    this.trackActivity(projectId, userId, ActivityType.UPDATED, {
      changedFields,
      newValues: updateProjectDto
    });
    
    return this.projects[projectIndex];
  }

  async deleteProject(projectId: string, userId: string) {
    const projectIndex = this.projects.findIndex(p => p.id === projectId && p.ownerId === userId);
    
    if (projectIndex === -1) {
      throw new NotFoundException('Project not found');
    }
    
    const deletedProject = this.projects[projectIndex];
    this.projects.splice(projectIndex, 1);
    
    // Delete all project files
    this.projectFiles = this.projectFiles.filter(file => file.projectId !== projectId);
    
    // Track project deletion activity (keeps activity history even after deletion)
    this.trackActivity(projectId, userId, ActivityType.DELETED, {
      projectName: deletedProject.name
    });
    
    return { message: 'Project deleted successfully', project: deletedProject };
  }

  async archiveProject(projectId: string, userId: string) {
    const projectIndex = this.projects.findIndex(p => p.id === projectId && p.ownerId === userId);
    
    if (projectIndex === -1) {
      throw new NotFoundException('Project not found');
    }
    
    this.projects[projectIndex].status = ProjectStatus.ARCHIVED;
    this.projects[projectIndex].updatedAt = new Date().toISOString();
    
    // Track project archiving as an update activity
    this.trackActivity(projectId, userId, ActivityType.UPDATED, {
      changedFields: ['status'],
      newValues: { status: ProjectStatus.ARCHIVED }
    });
    
    return this.projects[projectIndex];
  }
  
  // Project Tags Methods
  
  async getProjectTags(projectId: string, userId: string) {
    const project = await this.getProjectById(projectId, userId);
    return { tags: project.tags || [] };
  }
  
  async addProjectTag(projectId: string, tagDto: AddProjectTagDto, userId: string) {
    const projectIndex = this.projects.findIndex(p => p.id === projectId && p.ownerId === userId);
    
    if (projectIndex === -1) {
      throw new NotFoundException('Project not found');
    }
    
    const project = this.projects[projectIndex];
    
    // Check if tag already exists
    if (project.tags.includes(tagDto.tag)) {
      throw new ConflictException(`Tag "${tagDto.tag}" already exists for this project`);
    }
    
    // Add the tag
    project.tags.push(tagDto.tag);
    project.updatedAt = new Date().toISOString();
    
    // Track tag addition activity
    this.trackActivity(projectId, userId, ActivityType.TAG_ADDED, {
      tag: tagDto.tag
    });
    
    return { message: 'Tag added successfully', tags: project.tags };
  }
  
  async removeProjectTag(projectId: string, tagDto: RemoveProjectTagDto, userId: string) {
    const projectIndex = this.projects.findIndex(p => p.id === projectId && p.ownerId === userId);
    
    if (projectIndex === -1) {
      throw new NotFoundException('Project not found');
    }
    
    const project = this.projects[projectIndex];
    
    // Check if tag exists
    const tagIndex = project.tags.indexOf(tagDto.tag);
    if (tagIndex === -1) {
      throw new NotFoundException(`Tag "${tagDto.tag}" not found`);
    }
    
    // Remove the tag
    project.tags.splice(tagIndex, 1);
    project.updatedAt = new Date().toISOString();
    
    // Track tag removal activity
    this.trackActivity(projectId, userId, ActivityType.TAG_REMOVED, {
      tag: tagDto.tag
    });
    
    return { message: 'Tag removed successfully', tags: project.tags };
  }
  
  async updateProjectTags(projectId: string, tagsDto: { tags: string[] }, userId: string) {
    const projectIndex = this.projects.findIndex(p => p.id === projectId && p.ownerId === userId);
    
    if (projectIndex === -1) {
      throw new NotFoundException('Project not found');
    }
    
    // Get the old tags for activity tracking
    const oldTags = [...this.projects[projectIndex].tags];
    
    // Update tags
    this.projects[projectIndex].tags = tagsDto.tags;
    this.projects[projectIndex].updatedAt = new Date().toISOString();
    
    // Track tag changes for activity
    const addedTags = tagsDto.tags.filter(tag => !oldTags.includes(tag));
    const removedTags = oldTags.filter(tag => !tagsDto.tags.includes(tag));
    
    // Track tag updates as an update activity
    this.trackActivity(projectId, userId, ActivityType.UPDATED, {
      changedFields: ['tags'],
      addedTags,
      removedTags
    });
    
    return { message: 'Tags updated successfully', tags: tagsDto.tags };
  }
  
  // Project Files Methods
  
  async getProjectFiles(projectId: string, userId: string, fileType?: FileType) {
    const project = await this.getProjectById(projectId, userId);
    
    let files = this.projectFiles.filter(file => file.projectId === projectId);
    
    // Filter by file type if specified
    if (fileType) {
      files = files.filter(file => file.type === fileType);
    }
    
    return files;
  }
  
  async getProjectFile(projectId: string, fileId: string, userId: string) {
    // Verify project exists and user has access
    await this.getProjectById(projectId, userId);
    
    // Find the file
    const file = this.projectFiles.find(f => f.id === fileId && f.projectId === projectId);
    
    if (!file) {
      throw new NotFoundException('File not found');
    }
    
    return file;
  }
  
  async addProjectFile(projectId: string, fileDto: ProjectFileDto, userId: string) {
    // Verify project exists and user has access
    await this.getProjectById(projectId, userId);
    
    // Create file record
    const newFile = {
      id: uuidv4(),
      projectId,
      ...fileDto,
      uploadedBy: userId,
      uploadedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.projectFiles.push(newFile);
    
    // Track file addition activity
    this.trackActivity(projectId, userId, ActivityType.FILE_ADDED, {
      fileId: newFile.id,
      fileName: newFile.name,
      fileType: newFile.type,
      fileSize: newFile.size
    });
    
    return newFile;
  }
  
  async updateProjectFile(projectId: string, fileId: string, updateDto: UpdateFileDto, userId: string) {
    // Verify project exists and user has access
    await this.getProjectById(projectId, userId);
    
    // Find the file
    const fileIndex = this.projectFiles.findIndex(f => f.id === fileId && f.projectId === projectId);
    
    if (fileIndex === -1) {
      throw new NotFoundException('File not found');
    }
    
    // Update the file
    this.projectFiles[fileIndex] = {
      ...this.projectFiles[fileIndex],
      ...updateDto,
      updatedAt: new Date().toISOString()
    };
    
    // Track file update activity
    this.trackActivity(projectId, userId, ActivityType.FILE_UPDATED, {
      fileId,
      fileName: this.projectFiles[fileIndex].name,
      changedFields: Object.keys(updateDto)
    });
    
    return this.projectFiles[fileIndex];
  }
  
  async deleteProjectFile(projectId: string, fileId: string, userId: string) {
    // Verify project exists and user has access
    await this.getProjectById(projectId, userId);
    
    // Find the file
    const fileIndex = this.projectFiles.findIndex(f => f.id === fileId && f.projectId === projectId);
    
    if (fileIndex === -1) {
      throw new NotFoundException('File not found');
    }
    
    const deletedFile = this.projectFiles[fileIndex];
    
    // Remove the file
    this.projectFiles.splice(fileIndex, 1);
    
    // Track file deletion activity
    this.trackActivity(projectId, userId, ActivityType.FILE_DELETED, {
      fileId,
      fileName: deletedFile.name,
      fileType: deletedFile.type
    });
    
    return { message: 'File deleted successfully', file: deletedFile };
  }
  
  // Project Activity Methods
  
  private trackActivity(projectId: string, userId: string, type: ActivityType, details?: any) {
    const activity = {
      id: uuidv4(),
      projectId,
      userId,
      type,
      timestamp: new Date().toISOString(),
      details
    };
    
    this.projectActivities.push(activity);
    return activity;
  }
  
  async getProjectActivities(projectId: string, userId: string, limit?: number) {
    // Verify project exists and user has access
    await this.getProjectById(projectId, userId);
    
    // Get activities for this project
    let activities = this.projectActivities
      .filter(activity => activity.projectId === projectId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    // Apply limit if provided
    if (limit && limit > 0) {
      activities = activities.slice(0, limit);
    }
    
    return activities;
  }

  // Upload a file to a project with content
  async uploadProjectFile(projectId: string, fileDto: FileUploadDto, userId: string): Promise<any> {
    // Verify the project exists and user has access
    const project = await this.getProjectById(projectId, userId);
    
    // Validate file size
    const buffer = Buffer.from(fileDto.content, 'base64');
    const fileSize = buffer.length;
    
    if (fileSize > this.globalFileSizeLimit) {
      throw new BadRequestException(`File size exceeds the maximum allowed limit of ${this.globalFileSizeLimit / (1024 * 1024)} MB`);
    }
    
    // Check for specific limits by file type/format
    if (fileDto.type || fileDto.format) {
      for (const limit of this.fileSizeLimits) {
        // Check if this limit applies to this file
        const typeMatches = !limit.affectedTypes || limit.affectedTypes.includes(fileDto.type);
        const formatMatches = !limit.affectedFormats || (fileDto.format && limit.affectedFormats.includes(fileDto.format));
        
        if (typeMatches || formatMatches) {
          if (fileSize > limit.maxFileSize) {
            throw new BadRequestException(`File size exceeds the maximum allowed limit of ${limit.maxFileSize / (1024 * 1024)} MB for this file type`);
          }
        }
      }
    }
    
    // Generate a unique filename to prevent collisions
    const fileHash = crypto.createHash('md5').update(`${Date.now()}-${fileDto.name}`).digest('hex');
    const fileName = `${fileHash}-${fileDto.name}`;
    const filePath = path.join(this.uploadBasePath, fileName);
    
    // Detect file format if not provided
    const format = fileDto.format || this.detectFileFormat(fileDto.name);
    
    // Write the file content to disk
    try {
      fs.writeFileSync(filePath, buffer);
    } catch (error) {
      throw new BadRequestException(`Failed to write file: ${error.message}`);
    }
    
    // Create file record in our database
    const newFile = {
      id: uuidv4(),
      projectId,
      name: fileDto.name,
      path: filePath,
      type: fileDto.type,
      format,
      size: fileSize,
      description: fileDto.description || '',
      uploadedBy: userId,
      uploadedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isShared: false,
      shareSettings: {
        isPublic: false,
      }
    };
    
    this.projectFiles.push(newFile);
    
    // Setup default permissions for the uploader (full access)
    this.setFilePermissions(newFile.id, userId, [
      FilePermission.VIEW,
      FilePermission.DOWNLOAD,
      FilePermission.EDIT,
      FilePermission.DELETE,
      FilePermission.SHARE,
      FilePermission.FULL_ACCESS
    ]);
    
    // Track activity
    this.trackActivity(projectId, userId, ActivityType.FILE_ADDED, {
      fileId: newFile.id,
      fileName: newFile.name,
      fileType: newFile.type,
      fileFormat: format,
      fileSize: fileSize
    });
    
    return newFile;
  }
  
  // Download a file from a project
  async downloadProjectFile(projectId: string, fileId: string, userId: string): Promise<FileDownloadResponseDto> {
    // Verify the project exists and user has access
    const project = await this.getProjectById(projectId, userId);
    
    // Find the file
    const file = await this.getProjectFile(projectId, fileId, userId);
    
    // Check if user has download permission
    await this.validateFilePermission(fileId, userId, FilePermission.DOWNLOAD);
    
    // Read the file content
    let fileContent;
    try {
      fileContent = fs.readFileSync(file.path);
    } catch (error) {
      throw new BadRequestException(`Failed to read file: ${error.message}`);
    }
    
    // Track download activity
    this.trackActivity(projectId, userId, ActivityType.FILE_DOWNLOADED, {
      fileId: file.id,
      fileName: file.name
    });
    
    // Return file with content
    return {
      name: file.name,
      type: file.type,
      format: file.format,
      size: file.size,
      content: fileContent.toString('base64')
    };
  }
  
  // Move a file from one project to another
  async moveProjectFile(projectId: string, fileId: string, moveDto: MoveFileDto, userId: string): Promise<any> {
    // Verify the source project exists and user has access
    const sourceProject = await this.getProjectById(projectId, userId);
    
    // Verify the target project exists and user has access
    const targetProject = await this.getProjectById(moveDto.targetProjectId, userId);
    
    // Find the file
    const fileIndex = this.projectFiles.findIndex(
      file => file.id === fileId && file.projectId === projectId
    );
    
    if (fileIndex === -1) {
      throw new NotFoundException('File not found');
    }
    
    const file = this.projectFiles[fileIndex];
    
    // Create a new file record for the target project
    const movedFile = {
      ...file,
      id: uuidv4(), // Generate new ID for the file in the target project
      projectId: targetProject.id,
      updatedAt: new Date().toISOString()
    };
    
    // Add to target project
    this.projectFiles.push(movedFile);
    
    // Remove from source project
    this.projectFiles.splice(fileIndex, 1);
    
    // Track activity in both projects
    this.trackActivity(projectId, userId, ActivityType.FILE_MOVED, {
      fileId: file.id,
      fileName: file.name,
      targetProjectId: targetProject.id,
      targetProjectName: targetProject.name
    });
    
    this.trackActivity(targetProject.id, userId, ActivityType.FILE_ADDED, {
      fileId: movedFile.id,
      fileName: movedFile.name,
      sourceProjectId: projectId,
      sourceProjectName: sourceProject.name
    });
    
    return {
      message: 'File moved successfully',
      file: movedFile
    };
  }

  // File Management methods
  
  // Get file permissions
  async getFilePermissions(fileId: string, userId: string): Promise<any> {
    const file = this.findFileById(fileId);
    if (!file) {
      throw new NotFoundException('File not found');
    }
    
    // Verify user can access the file (need at least VIEW)
    await this.validateFilePermission(fileId, userId, FilePermission.VIEW);
    
    // Need SHARE permission to view all permissions
    const hasSharePermission = await this.hasFilePermission(fileId, userId, FilePermission.SHARE);
    
    if (!hasSharePermission) {
      // Only return their own permissions
      const userPermissions = this.filePermissions.filter(p => p.fileId === fileId && p.userId === userId);
      return { userPermissions };
    }
    
    // Return all permissions
    const allPermissions = this.filePermissions.filter(p => p.fileId === fileId);
    return { fileId, permissions: allPermissions };
  }
  
  // Set file permissions for a user
  async setFilePermissions(fileId: string, userId: string, permissions: FilePermission[]): Promise<any> {
    const file = this.findFileById(fileId);
    if (!file) {
      throw new NotFoundException('File not found');
    }
    
    // Remove existing permissions for this user
    const existingPermIndex = this.filePermissions.findIndex(p => p.fileId === fileId && p.userId === userId);
    if (existingPermIndex !== -1) {
      this.filePermissions.splice(existingPermIndex, 1);
    }
    
    // Add new permissions
    const permissionRecord = {
      id: uuidv4(),
      fileId,
      userId,
      permissions,
      createdAt: new Date().toISOString()
    };
    
    this.filePermissions.push(permissionRecord);
    return permissionRecord;
  }
  
  // Update file permissions for multiple users
  async updateFilePermissions(projectId: string, fileId: string, permissionsDto: UpdateFilePermissionsDto, userId: string): Promise<any> {
    // Verify the project exists and user has access
    const project = await this.getProjectById(projectId, userId);
    
    // Find the file
    const file = await this.getProjectFile(projectId, fileId, userId);
    
    // Verify user has permission to manage permissions
    await this.validateFilePermission(fileId, userId, FilePermission.SHARE);
    
    // Update permissions for each user
    const updatedPermissions = [];
    for (const userPerm of permissionsDto.userPermissions) {
      const permRecord = await this.setFilePermissions(fileId, userPerm.userId, userPerm.permissions);
      updatedPermissions.push(permRecord);
    }
    
    // Track activity
    this.trackActivity(projectId, userId, ActivityType.FILE_PERMISSION_UPDATED, {
      fileId,
      fileName: file.name,
      updatedPermissions: permissionsDto.userPermissions
    });
    
    return { message: 'File permissions updated successfully', permissions: updatedPermissions };
  }
  
  // Share a file with another user
  async shareFileWithUser(projectId: string, fileId: string, shareDto: ShareFileWithUserDto, userId: string): Promise<any> {
    // Verify the project exists and user has access
    const project = await this.getProjectById(projectId, userId);
    
    // Find the file
    const file = await this.getProjectFile(projectId, fileId, userId);
    
    // Verify user has permission to share
    await this.validateFilePermission(fileId, userId, FilePermission.SHARE);
    
    // Create the share record
    const shareRecord = {
      id: uuidv4(),
      fileId,
      sharedByUserId: userId,
      sharedWithUserId: shareDto.userId,
      permissions: shareDto.permissions,
      message: shareDto.message || '',
      expirationDate: shareDto.expirationDate ? new Date(shareDto.expirationDate).toISOString() : null,
      createdAt: new Date().toISOString()
    };
    
    this.userShares.push(shareRecord);
    
    // Set permissions for the target user
    await this.setFilePermissions(fileId, shareDto.userId, shareDto.permissions);
    
    // Mark file as shared
    const fileIndex = this.projectFiles.findIndex(f => f.id === fileId);
    if (fileIndex !== -1) {
      this.projectFiles[fileIndex].isShared = true;
    }
    
    // Track activity
    this.trackActivity(projectId, userId, ActivityType.FILE_SHARED, {
      fileId,
      fileName: file.name,
      sharedWithUserId: shareDto.userId,
      permissions: shareDto.permissions
    });
    
    return {
      message: 'File shared successfully',
      share: shareRecord
    };
  }
  
  // Share a file with an email address
  async shareFileWithEmail(projectId: string, fileId: string, shareDto: ShareFileWithEmailDto, userId: string): Promise<any> {
    // Verify the project exists and user has access
    const project = await this.getProjectById(projectId, userId);
    
    // Find the file
    const file = await this.getProjectFile(projectId, fileId, userId);
    
    // Verify user has permission to share
    await this.validateFilePermission(fileId, userId, FilePermission.SHARE);
    
    // Create the share record
    const shareRecord = {
      id: uuidv4(),
      fileId,
      sharedByUserId: userId,
      email: shareDto.email,
      permissions: shareDto.permissions,
      message: shareDto.message || '',
      expirationDate: shareDto.expirationDate ? new Date(shareDto.expirationDate).toISOString() : null,
      isAccepted: false,
      createdAt: new Date().toISOString()
    };
    
    this.emailShares.push(shareRecord);
    
    // Mark file as shared
    const fileIndex = this.projectFiles.findIndex(f => f.id === fileId);
    if (fileIndex !== -1) {
      this.projectFiles[fileIndex].isShared = true;
    }
    
    // Track activity
    this.trackActivity(projectId, userId, ActivityType.FILE_SHARED, {
      fileId,
      fileName: file.name,
      sharedWithEmail: shareDto.email,
      permissions: shareDto.permissions
    });
    
    // In a real implementation, send an email with a link to accept the share
    
    return {
      message: 'File share invitation sent successfully',
      share: shareRecord
    };
  }
  
  // Generate a share link for a file
  async generateShareLink(projectId: string, fileId: string, shareLinkDto: GenerateShareLinkDto, userId: string): Promise<ShareLinkResponseDto> {
    // Verify the project exists and user has access
    const project = await this.getProjectById(projectId, userId);
    
    // Find the file
    const file = await this.getProjectFile(projectId, fileId, userId);
    
    // Verify user has permission to share
    await this.validateFilePermission(fileId, userId, FilePermission.SHARE);
    
    // Create a unique token for the share link
    const token = crypto.randomBytes(32).toString('hex');
    
    // Hash password if provided
    let hashedPassword = null;
    if (shareLinkDto.password) {
      hashedPassword = await bcrypt.hash(shareLinkDto.password, 10);
    }
    
    // Create the share link record
    const shareLink = {
      id: uuidv4(),
      fileId,
      token,
      createdByUserId: userId,
      permissions: shareLinkDto.permissions,
      expirationDate: shareLinkDto.expirationDate ? new Date(shareLinkDto.expirationDate).toISOString() : null,
      password: hashedPassword,
      maxUses: shareLinkDto.maxUses || null,
      usesCount: 0,
      createdAt: new Date().toISOString()
    };
    
    this.shareLinks.push(shareLink);
    
    // Mark file as shared
    const fileIndex = this.projectFiles.findIndex(f => f.id === fileId);
    if (fileIndex !== -1) {
      this.projectFiles[fileIndex].isShared = true;
    }
    
    // Track activity
    this.trackActivity(projectId, userId, ActivityType.FILE_SHARED, {
      fileId,
      fileName: file.name,
      shareLink: true,
      permissions: shareLinkDto.permissions
    });
    
    // Create a share link URL (in a real app, use environment config for base URL)
    const baseUrl = 'https://example.com/share';
    const url = `${baseUrl}/${token}`;
    
    return {
      id: shareLink.id,
      url,
      permissions: shareLinkDto.permissions,
      expirationDate: shareLinkDto.expirationDate,
      isPasswordProtected: !!hashedPassword,
      maxUses: shareLinkDto.maxUses,
      usesCount: 0,
      createdAt: new Date()
    };
  }
  
  // Access a file via share link
  async accessSharedFile(token: string, password?: string): Promise<any> {
    // Find the share link
    const shareLink = this.shareLinks.find(link => link.token === token);
    if (!shareLink) {
      throw new NotFoundException('Share link not found or has expired');
    }
    
    // Check if link has expired
    if (shareLink.expirationDate) {
      const expirationDate = new Date(shareLink.expirationDate);
      if (expirationDate < new Date()) {
        throw new BadRequestException('Share link has expired');
      }
    }
    
    // Check if max uses exceeded
    if (shareLink.maxUses !== null && shareLink.usesCount >= shareLink.maxUses) {
      throw new BadRequestException('Share link has reached its maximum number of uses');
    }
    
    // Validate password if required
    if (shareLink.password) {
      if (!password) {
        throw new UnauthorizedException('Password is required to access this file');
      }
      
      const isPasswordValid = await bcrypt.compare(password, shareLink.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid password');
      }
    }
    
    // Find the file
    const file = this.projectFiles.find(f => f.id === shareLink.fileId);
    if (!file) {
      throw new NotFoundException('File not found');
    }
    
    // Increment usage count
    const shareLinkIndex = this.shareLinks.findIndex(link => link.token === token);
    if (shareLinkIndex !== -1) {
      this.shareLinks[shareLinkIndex].usesCount++;
    }
    
    // Return file metadata (content if download permission exists)
    if (shareLink.permissions.includes(FilePermission.DOWNLOAD)) {
      try {
        const fileContent = fs.readFileSync(file.path);
        return {
          ...file,
          content: fileContent.toString('base64')
        };
      } catch (error) {
        throw new BadRequestException(`Failed to read file: ${error.message}`);
      }
    } else {
      // Only return metadata for VIEW permission
      return {
        id: file.id,
        name: file.name,
        type: file.type,
        format: file.format,
        size: file.size,
        description: file.description,
        uploadedAt: file.uploadedAt
      };
    }
  }
  
  // Update file size limits
  async updateFileSizeLimit(limitDto: FileSizeLimitDto): Promise<any> {
    if (!limitDto.affectedTypes && !limitDto.affectedFormats) {
      // Update global limit
      this.globalFileSizeLimit = limitDto.maxFileSize;
      return { message: 'Global file size limit updated successfully', limit: limitDto.maxFileSize };
    }
    
    // Find existing limit with same type/format combo
    const existingLimitIndex = this.fileSizeLimits.findIndex(limit => {
      const typesMatch = JSON.stringify(limit.affectedTypes) === JSON.stringify(limitDto.affectedTypes);
      const formatsMatch = JSON.stringify(limit.affectedFormats) === JSON.stringify(limitDto.affectedFormats);
      return typesMatch && formatsMatch;
    });
    
    if (existingLimitIndex !== -1) {
      // Update existing limit
      this.fileSizeLimits[existingLimitIndex].maxFileSize = limitDto.maxFileSize;
      return { 
        message: 'File size limit updated successfully', 
        limit: this.fileSizeLimits[existingLimitIndex] 
      };
    } else {
      // Add new limit
      const newLimit = {
        id: uuidv4(),
        maxFileSize: limitDto.maxFileSize,
        affectedTypes: limitDto.affectedTypes || [],
        affectedFormats: limitDto.affectedFormats || [],
        createdAt: new Date().toISOString()
      };
      
      this.fileSizeLimits.push(newLimit);
      return { message: 'File size limit added successfully', limit: newLimit };
    }
  }
  
  // Helper to check if a user has a specific permission for a file
  private async hasFilePermission(fileId: string, userId: string, permission: FilePermission): Promise<boolean> {
    const file = this.findFileById(fileId);
    
    // File uploader always has full access
    if (file && file.uploadedBy === userId) {
      return true;
    }
    
    // Check explicit permissions
    const userPermission = this.filePermissions.find(p => p.fileId === fileId && p.userId === userId);
    
    if (!userPermission) {
      return false;
    }
    
    // FULL_ACCESS grants all permissions
    if (userPermission.permissions.includes(FilePermission.FULL_ACCESS)) {
      return true;
    }
    
    return userPermission.permissions.includes(permission);
  }
  
  // Helper to validate if a user has permission, throws error if not
  private async validateFilePermission(fileId: string, userId: string, permission: FilePermission): Promise<void> {
    const hasPermission = await this.hasFilePermission(fileId, userId, permission);
    
    if (!hasPermission) {
      throw new ForbiddenException(`You don't have ${permission} permission for this file`);
    }
  }
  
  // Helper to find a file by ID without project validation
  private findFileById(fileId: string): any {
    return this.projectFiles.find(file => file.id === fileId);
  }
  
  // Helper to detect file format from filename
  private detectFileFormat(filename: string): FileFormat {
    const extension = filename.split('.').pop().toLowerCase();
    
    // Map extension to FileFormat
    const formatMap = {
      // Documents
      'pdf': FileFormat.PDF,
      'doc': FileFormat.DOC,
      'docx': FileFormat.DOCX,
      'xls': FileFormat.XLS,
      'xlsx': FileFormat.XLSX,
      'ppt': FileFormat.PPT,
      'pptx': FileFormat.PPTX,
      'txt': FileFormat.TXT,
      'rtf': FileFormat.RTF,
      
      // Images
      'jpg': FileFormat.JPG,
      'jpeg': FileFormat.JPEG,
      'png': FileFormat.PNG,
      'gif': FileFormat.GIF,
      'bmp': FileFormat.BMP,
      'svg': FileFormat.SVG,
      'webp': FileFormat.WEBP,
      
      // Videos
      'mp4': FileFormat.MP4,
      'avi': FileFormat.AVI,
      'mov': FileFormat.MOV,
      'wmv': FileFormat.WMV,
      'mkv': FileFormat.MKV,
      
      // Audio
      'mp3': FileFormat.MP3,
      'wav': FileFormat.WAV,
      'ogg': FileFormat.OGG,
      'flac': FileFormat.FLAC,
      
      // Archives
      'zip': FileFormat.ZIP,
      'rar': FileFormat.RAR,
      'tar': FileFormat.TAR,
      'gz': FileFormat.GZIP,
    };
    
    return formatMap[extension] || FileFormat.OTHER;
  }
} 