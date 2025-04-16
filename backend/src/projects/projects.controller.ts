import { Controller, Post, Get, Patch, Delete, Body, Param, Query, UseInterceptors, UploadedFile, ParseIntPipe, Put, HttpCode, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import { AddProjectTagDto, RemoveProjectTagDto, ProjectTagsDto, ProjectFileDto, UpdateFileDto, FileUploadDto, MoveFileDto, FileType, FileSizeLimitDto, UpdateFilePermissionsDto, ShareFileWithUserDto, ShareFileWithEmailDto, GenerateShareLinkDto, FileFormat } from './dto/project-features.dto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  createProject(@Body() createProjectDto: CreateProjectDto, @Query('userId') userId: string) {
    return this.projectsService.createProject(createProjectDto, userId);
  }

  @Get()
  getProjects(@Query('userId') userId: string) {
    return this.projectsService.getProjects(userId);
  }

  @Get(':id')
  getProjectById(@Param('id') id: string, @Query('userId') userId: string) {
    return this.projectsService.getProjectById(id, userId);
  }

  @Patch(':id')
  updateProject(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @Query('userId') userId: string
  ) {
    return this.projectsService.updateProject(id, updateProjectDto, userId);
  }

  @Delete(':id')
  deleteProject(@Param('id') id: string, @Query('userId') userId: string) {
    return this.projectsService.deleteProject(id, userId);
  }

  @Patch(':id/archive')
  archiveProject(@Param('id') id: string, @Query('userId') userId: string) {
    return this.projectsService.archiveProject(id, userId);
  }
  
  // Tags endpoints
  
  @Get(':id/tags')
  getProjectTags(@Param('id') id: string, @Query('userId') userId: string) {
    return this.projectsService.getProjectTags(id, userId);
  }
  
  @Post(':id/tags')
  addProjectTag(
    @Param('id') id: string,
    @Body() tagDto: AddProjectTagDto,
    @Query('userId') userId: string
  ) {
    return this.projectsService.addProjectTag(id, tagDto, userId);
  }
  
  @Delete(':id/tags')
  removeProjectTag(
    @Param('id') id: string,
    @Body() tagDto: RemoveProjectTagDto,
    @Query('userId') userId: string
  ) {
    return this.projectsService.removeProjectTag(id, tagDto, userId);
  }
  
  @Patch(':id/tags')
  updateProjectTags(
    @Param('id') id: string,
    @Body() tagsDto: ProjectTagsDto,
    @Query('userId') userId: string
  ) {
    return this.projectsService.updateProjectTags(id, tagsDto, userId);
  }
  
  // Files endpoints
  
  @Get(':id/files')
  async getProjectFiles(
    @Param('id') projectId: string, 
    @Query('userId') userId: string,
    @Query('type') fileType?: FileType
  ) {
    return this.projectsService.getProjectFiles(projectId, userId, fileType);
  }
  
  @Get(':id/files/:fileId')
  async getProjectFile(
    @Param('id') projectId: string, 
    @Param('fileId') fileId: string, 
    @Query('userId') userId: string
  ) {
    return this.projectsService.getProjectFile(projectId, fileId, userId);
  }
  
  @Post(':id/files')
  async addProjectFile(
    @Param('id') projectId: string, 
    @Body() fileDto: ProjectFileDto, 
    @Query('userId') userId: string
  ) {
    return this.projectsService.addProjectFile(projectId, fileDto, userId);
  }
  
  @Post(':id/files/upload')
  async uploadProjectFile(
    @Param('id') projectId: string, 
    @Body() fileUploadDto: FileUploadDto, 
    @Query('userId') userId: string
  ) {
    return this.projectsService.uploadProjectFile(projectId, fileUploadDto, userId);
  }
  
  @Get(':id/files/:fileId/download')
  async downloadProjectFile(
    @Param('id') projectId: string, 
    @Param('fileId') fileId: string, 
    @Query('userId') userId: string
  ) {
    return this.projectsService.downloadProjectFile(projectId, fileId, userId);
  }
  
  @Post(':id/files/:fileId/move')
  async moveProjectFile(
    @Param('id') projectId: string, 
    @Param('fileId') fileId: string, 
    @Body() moveFileDto: MoveFileDto, 
    @Query('userId') userId: string
  ) {
    return this.projectsService.moveProjectFile(projectId, fileId, moveFileDto, userId);
  }
  
  @Patch(':id/files/:fileId')
  async updateProjectFile(
    @Param('id') projectId: string, 
    @Param('fileId') fileId: string, 
    @Body() updateDto: UpdateFileDto, 
    @Query('userId') userId: string
  ) {
    return this.projectsService.updateProjectFile(projectId, fileId, updateDto, userId);
  }
  
  @Delete(':id/files/:fileId')
  async deleteProjectFile(
    @Param('id') projectId: string, 
    @Param('fileId') fileId: string, 
    @Query('userId') userId: string
  ) {
    return this.projectsService.deleteProjectFile(projectId, fileId, userId);
  }
  
  // Activity endpoints
  
  @Get(':id/activities')
  getProjectActivities(
    @Param('id') id: string,
    @Query('userId') userId: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number
  ) {
    return this.projectsService.getProjectActivities(id, userId, limit);
  }

  // Enhanced File Management Endpoints

  // Filter files by type
  @Get(':id/files/by-type/:type')
  async getFilesByType(
    @Param('id') projectId: string,
    @Param('type') fileType: FileType,
    @Query('userId') userId: string
  ) {
    return this.projectsService.getProjectFiles(projectId, userId, fileType);
  }

  // Filter files by format
  @Get(':id/files/by-format/:format')
  async getFilesByFormat(
    @Param('id') projectId: string,
    @Param('format') format: FileFormat,
    @Query('userId') userId: string
  ) {
    const files = await this.projectsService.getProjectFiles(projectId, userId);
    return files.filter(file => file.format === format);
  }

  // File permissions management
  @Get(':id/files/:fileId/permissions')
  async getFilePermissions(
    @Param('id') projectId: string,
    @Param('fileId') fileId: string,
    @Query('userId') userId: string
  ) {
    // Project ID is used to verify access
    await this.projectsService.getProjectById(projectId, userId);
    return this.projectsService.getFilePermissions(fileId, userId);
  }

  @Patch(':id/files/:fileId/permissions')
  async updateFilePermissions(
    @Param('id') projectId: string,
    @Param('fileId') fileId: string,
    @Body() permissionsDto: UpdateFilePermissionsDto,
    @Query('userId') userId: string
  ) {
    return this.projectsService.updateFilePermissions(projectId, fileId, permissionsDto, userId);
  }

  // File sharing endpoints
  @Post(':id/files/:fileId/share/user')
  async shareFileWithUser(
    @Param('id') projectId: string,
    @Param('fileId') fileId: string,
    @Body() shareDto: ShareFileWithUserDto,
    @Query('userId') userId: string
  ) {
    return this.projectsService.shareFileWithUser(projectId, fileId, shareDto, userId);
  }

  @Post(':id/files/:fileId/share/email')
  async shareFileWithEmail(
    @Param('id') projectId: string,
    @Param('fileId') fileId: string,
    @Body() shareDto: ShareFileWithEmailDto,
    @Query('userId') userId: string
  ) {
    return this.projectsService.shareFileWithEmail(projectId, fileId, shareDto, userId);
  }

  @Post(':id/files/:fileId/share/link')
  async generateShareLink(
    @Param('id') projectId: string,
    @Param('fileId') fileId: string,
    @Body() shareLinkDto: GenerateShareLinkDto,
    @Query('userId') userId: string
  ) {
    return this.projectsService.generateShareLink(projectId, fileId, shareLinkDto, userId);
  }

  // Access shared file via token
  @Get('shared/:token')
  async accessSharedFile(
    @Param('token') token: string,
    @Query('password') password?: string
  ) {
    return this.projectsService.accessSharedFile(token, password);
  }

  // File size limit management
  @Post('admin/file-size-limits')
  async updateFileSizeLimit(
    @Body() limitDto: FileSizeLimitDto
  ) {
    return this.projectsService.updateFileSizeLimit(limitDto);
  }
} 