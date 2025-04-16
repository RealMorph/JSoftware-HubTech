"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const project_dto_1 = require("./dto/project.dto");
const project_features_dto_1 = require("./dto/project-features.dto");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
let ProjectsService = class ProjectsService {
    constructor() {
        this.projects = [];
        this.projectFiles = [];
        this.projectActivities = [];
        this.filePermissions = [];
        this.shareLinks = [];
        this.userShares = [];
        this.emailShares = [];
        this.uploadBasePath = './uploads';
        this.globalFileSizeLimit = 209715200;
        this.fileSizeLimits = [];
        if (!fs.existsSync(this.uploadBasePath)) {
            fs.mkdirSync(this.uploadBasePath, { recursive: true });
        }
    }
    async createProject(createProjectDto, userId) {
        const { name, description, status, visibility, tags, startDate, endDate } = createProjectDto;
        if (!name) {
            throw new common_1.BadRequestException('Project name is required');
        }
        const existingProject = this.projects.find(p => p.name === name && p.ownerId === userId);
        if (existingProject) {
            throw new common_1.ConflictException(`Project with name "${name}" already exists`);
        }
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (isNaN(start.getTime())) {
                throw new common_1.BadRequestException('Invalid start date format');
            }
            if (isNaN(end.getTime())) {
                throw new common_1.BadRequestException('Invalid end date format');
            }
            if (start > end) {
                throw new common_1.BadRequestException('Start date cannot be after end date');
            }
        }
        const newProject = {
            id: (0, uuid_1.v4)(),
            name,
            description: description || '',
            status: status || project_dto_1.ProjectStatus.ACTIVE,
            visibility: visibility || project_dto_1.ProjectVisibility.PRIVATE,
            tags: tags || [],
            startDate,
            endDate,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ownerId: userId
        };
        this.projects.push(newProject);
        this.trackActivity(newProject.id, userId, project_features_dto_1.ActivityType.CREATED, {
            projectName: newProject.name
        });
        return newProject;
    }
    async getProjects(userId) {
        return this.projects.filter(project => project.ownerId === userId);
    }
    async getProjectById(projectId, userId) {
        const project = this.projects.find(p => p.id === projectId && (p.ownerId === userId || p.visibility === project_dto_1.ProjectVisibility.PUBLIC));
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        return project;
    }
    async updateProject(projectId, updateProjectDto, userId) {
        const projectIndex = this.projects.findIndex(p => p.id === projectId && p.ownerId === userId);
        if (projectIndex === -1) {
            throw new common_1.NotFoundException('Project not found');
        }
        const project = this.projects[projectIndex];
        if (updateProjectDto.name && updateProjectDto.name !== project.name) {
            const existingProject = this.projects.find(p => p.name === updateProjectDto.name && p.ownerId === userId && p.id !== projectId);
            if (existingProject) {
                throw new common_1.ConflictException(`Project with name "${updateProjectDto.name}" already exists`);
            }
        }
        if (updateProjectDto.startDate && updateProjectDto.endDate) {
            const start = new Date(updateProjectDto.startDate);
            const end = new Date(updateProjectDto.endDate);
            if (isNaN(start.getTime())) {
                throw new common_1.BadRequestException('Invalid start date format');
            }
            if (isNaN(end.getTime())) {
                throw new common_1.BadRequestException('Invalid end date format');
            }
            if (start > end) {
                throw new common_1.BadRequestException('Start date cannot be after end date');
            }
        }
        else if (updateProjectDto.startDate && project.endDate) {
            const start = new Date(updateProjectDto.startDate);
            const end = new Date(project.endDate);
            if (isNaN(start.getTime())) {
                throw new common_1.BadRequestException('Invalid start date format');
            }
            if (start > end) {
                throw new common_1.BadRequestException('Start date cannot be after end date');
            }
        }
        else if (updateProjectDto.endDate && project.startDate) {
            const start = new Date(project.startDate);
            const end = new Date(updateProjectDto.endDate);
            if (isNaN(end.getTime())) {
                throw new common_1.BadRequestException('Invalid end date format');
            }
            if (start > end) {
                throw new common_1.BadRequestException('Start date cannot be after end date');
            }
        }
        const changedFields = Object.keys(updateProjectDto);
        this.projects[projectIndex] = Object.assign(Object.assign(Object.assign({}, project), updateProjectDto), { updatedAt: new Date().toISOString() });
        this.trackActivity(projectId, userId, project_features_dto_1.ActivityType.UPDATED, {
            changedFields,
            newValues: updateProjectDto
        });
        return this.projects[projectIndex];
    }
    async deleteProject(projectId, userId) {
        const projectIndex = this.projects.findIndex(p => p.id === projectId && p.ownerId === userId);
        if (projectIndex === -1) {
            throw new common_1.NotFoundException('Project not found');
        }
        const deletedProject = this.projects[projectIndex];
        this.projects.splice(projectIndex, 1);
        this.projectFiles = this.projectFiles.filter(file => file.projectId !== projectId);
        this.trackActivity(projectId, userId, project_features_dto_1.ActivityType.DELETED, {
            projectName: deletedProject.name
        });
        return { message: 'Project deleted successfully', project: deletedProject };
    }
    async archiveProject(projectId, userId) {
        const projectIndex = this.projects.findIndex(p => p.id === projectId && p.ownerId === userId);
        if (projectIndex === -1) {
            throw new common_1.NotFoundException('Project not found');
        }
        this.projects[projectIndex].status = project_dto_1.ProjectStatus.ARCHIVED;
        this.projects[projectIndex].updatedAt = new Date().toISOString();
        this.trackActivity(projectId, userId, project_features_dto_1.ActivityType.UPDATED, {
            changedFields: ['status'],
            newValues: { status: project_dto_1.ProjectStatus.ARCHIVED }
        });
        return this.projects[projectIndex];
    }
    async getProjectTags(projectId, userId) {
        const project = await this.getProjectById(projectId, userId);
        return { tags: project.tags || [] };
    }
    async addProjectTag(projectId, tagDto, userId) {
        const projectIndex = this.projects.findIndex(p => p.id === projectId && p.ownerId === userId);
        if (projectIndex === -1) {
            throw new common_1.NotFoundException('Project not found');
        }
        const project = this.projects[projectIndex];
        if (project.tags.includes(tagDto.tag)) {
            throw new common_1.ConflictException(`Tag "${tagDto.tag}" already exists for this project`);
        }
        project.tags.push(tagDto.tag);
        project.updatedAt = new Date().toISOString();
        this.trackActivity(projectId, userId, project_features_dto_1.ActivityType.TAG_ADDED, {
            tag: tagDto.tag
        });
        return { message: 'Tag added successfully', tags: project.tags };
    }
    async removeProjectTag(projectId, tagDto, userId) {
        const projectIndex = this.projects.findIndex(p => p.id === projectId && p.ownerId === userId);
        if (projectIndex === -1) {
            throw new common_1.NotFoundException('Project not found');
        }
        const project = this.projects[projectIndex];
        const tagIndex = project.tags.indexOf(tagDto.tag);
        if (tagIndex === -1) {
            throw new common_1.NotFoundException(`Tag "${tagDto.tag}" not found`);
        }
        project.tags.splice(tagIndex, 1);
        project.updatedAt = new Date().toISOString();
        this.trackActivity(projectId, userId, project_features_dto_1.ActivityType.TAG_REMOVED, {
            tag: tagDto.tag
        });
        return { message: 'Tag removed successfully', tags: project.tags };
    }
    async updateProjectTags(projectId, tagsDto, userId) {
        const projectIndex = this.projects.findIndex(p => p.id === projectId && p.ownerId === userId);
        if (projectIndex === -1) {
            throw new common_1.NotFoundException('Project not found');
        }
        const oldTags = [...this.projects[projectIndex].tags];
        this.projects[projectIndex].tags = tagsDto.tags;
        this.projects[projectIndex].updatedAt = new Date().toISOString();
        const addedTags = tagsDto.tags.filter(tag => !oldTags.includes(tag));
        const removedTags = oldTags.filter(tag => !tagsDto.tags.includes(tag));
        this.trackActivity(projectId, userId, project_features_dto_1.ActivityType.UPDATED, {
            changedFields: ['tags'],
            addedTags,
            removedTags
        });
        return { message: 'Tags updated successfully', tags: tagsDto.tags };
    }
    async getProjectFiles(projectId, userId, fileType) {
        const project = await this.getProjectById(projectId, userId);
        let files = this.projectFiles.filter(file => file.projectId === projectId);
        if (fileType) {
            files = files.filter(file => file.type === fileType);
        }
        return files;
    }
    async getProjectFile(projectId, fileId, userId) {
        await this.getProjectById(projectId, userId);
        const file = this.projectFiles.find(f => f.id === fileId && f.projectId === projectId);
        if (!file) {
            throw new common_1.NotFoundException('File not found');
        }
        return file;
    }
    async addProjectFile(projectId, fileDto, userId) {
        await this.getProjectById(projectId, userId);
        const newFile = Object.assign(Object.assign({ id: (0, uuid_1.v4)(), projectId }, fileDto), { uploadedBy: userId, uploadedAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
        this.projectFiles.push(newFile);
        this.trackActivity(projectId, userId, project_features_dto_1.ActivityType.FILE_ADDED, {
            fileId: newFile.id,
            fileName: newFile.name,
            fileType: newFile.type,
            fileSize: newFile.size
        });
        return newFile;
    }
    async updateProjectFile(projectId, fileId, updateDto, userId) {
        await this.getProjectById(projectId, userId);
        const fileIndex = this.projectFiles.findIndex(f => f.id === fileId && f.projectId === projectId);
        if (fileIndex === -1) {
            throw new common_1.NotFoundException('File not found');
        }
        this.projectFiles[fileIndex] = Object.assign(Object.assign(Object.assign({}, this.projectFiles[fileIndex]), updateDto), { updatedAt: new Date().toISOString() });
        this.trackActivity(projectId, userId, project_features_dto_1.ActivityType.FILE_UPDATED, {
            fileId,
            fileName: this.projectFiles[fileIndex].name,
            changedFields: Object.keys(updateDto)
        });
        return this.projectFiles[fileIndex];
    }
    async deleteProjectFile(projectId, fileId, userId) {
        await this.getProjectById(projectId, userId);
        const fileIndex = this.projectFiles.findIndex(f => f.id === fileId && f.projectId === projectId);
        if (fileIndex === -1) {
            throw new common_1.NotFoundException('File not found');
        }
        const deletedFile = this.projectFiles[fileIndex];
        this.projectFiles.splice(fileIndex, 1);
        this.trackActivity(projectId, userId, project_features_dto_1.ActivityType.FILE_DELETED, {
            fileId,
            fileName: deletedFile.name,
            fileType: deletedFile.type
        });
        return { message: 'File deleted successfully', file: deletedFile };
    }
    trackActivity(projectId, userId, type, details) {
        const activity = {
            id: (0, uuid_1.v4)(),
            projectId,
            userId,
            type,
            timestamp: new Date().toISOString(),
            details
        };
        this.projectActivities.push(activity);
        return activity;
    }
    async getProjectActivities(projectId, userId, limit) {
        await this.getProjectById(projectId, userId);
        let activities = this.projectActivities
            .filter(activity => activity.projectId === projectId)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        if (limit && limit > 0) {
            activities = activities.slice(0, limit);
        }
        return activities;
    }
    async uploadProjectFile(projectId, fileDto, userId) {
        const project = await this.getProjectById(projectId, userId);
        const buffer = Buffer.from(fileDto.content, 'base64');
        const fileSize = buffer.length;
        if (fileSize > this.globalFileSizeLimit) {
            throw new common_1.BadRequestException(`File size exceeds the maximum allowed limit of ${this.globalFileSizeLimit / (1024 * 1024)} MB`);
        }
        if (fileDto.type || fileDto.format) {
            for (const limit of this.fileSizeLimits) {
                const typeMatches = !limit.affectedTypes || limit.affectedTypes.includes(fileDto.type);
                const formatMatches = !limit.affectedFormats || (fileDto.format && limit.affectedFormats.includes(fileDto.format));
                if (typeMatches || formatMatches) {
                    if (fileSize > limit.maxFileSize) {
                        throw new common_1.BadRequestException(`File size exceeds the maximum allowed limit of ${limit.maxFileSize / (1024 * 1024)} MB for this file type`);
                    }
                }
            }
        }
        const fileHash = crypto.createHash('md5').update(`${Date.now()}-${fileDto.name}`).digest('hex');
        const fileName = `${fileHash}-${fileDto.name}`;
        const filePath = path.join(this.uploadBasePath, fileName);
        const format = fileDto.format || this.detectFileFormat(fileDto.name);
        try {
            fs.writeFileSync(filePath, buffer);
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to write file: ${error.message}`);
        }
        const newFile = {
            id: (0, uuid_1.v4)(),
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
        this.setFilePermissions(newFile.id, userId, [
            project_features_dto_1.FilePermission.VIEW,
            project_features_dto_1.FilePermission.DOWNLOAD,
            project_features_dto_1.FilePermission.EDIT,
            project_features_dto_1.FilePermission.DELETE,
            project_features_dto_1.FilePermission.SHARE,
            project_features_dto_1.FilePermission.FULL_ACCESS
        ]);
        this.trackActivity(projectId, userId, project_features_dto_1.ActivityType.FILE_ADDED, {
            fileId: newFile.id,
            fileName: newFile.name,
            fileType: newFile.type,
            fileFormat: format,
            fileSize: fileSize
        });
        return newFile;
    }
    async downloadProjectFile(projectId, fileId, userId) {
        const project = await this.getProjectById(projectId, userId);
        const file = await this.getProjectFile(projectId, fileId, userId);
        await this.validateFilePermission(fileId, userId, project_features_dto_1.FilePermission.DOWNLOAD);
        let fileContent;
        try {
            fileContent = fs.readFileSync(file.path);
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to read file: ${error.message}`);
        }
        this.trackActivity(projectId, userId, project_features_dto_1.ActivityType.FILE_DOWNLOADED, {
            fileId: file.id,
            fileName: file.name
        });
        return {
            name: file.name,
            type: file.type,
            format: file.format,
            size: file.size,
            content: fileContent.toString('base64')
        };
    }
    async moveProjectFile(projectId, fileId, moveDto, userId) {
        const sourceProject = await this.getProjectById(projectId, userId);
        const targetProject = await this.getProjectById(moveDto.targetProjectId, userId);
        const fileIndex = this.projectFiles.findIndex(file => file.id === fileId && file.projectId === projectId);
        if (fileIndex === -1) {
            throw new common_1.NotFoundException('File not found');
        }
        const file = this.projectFiles[fileIndex];
        const movedFile = Object.assign(Object.assign({}, file), { id: (0, uuid_1.v4)(), projectId: targetProject.id, updatedAt: new Date().toISOString() });
        this.projectFiles.push(movedFile);
        this.projectFiles.splice(fileIndex, 1);
        this.trackActivity(projectId, userId, project_features_dto_1.ActivityType.FILE_MOVED, {
            fileId: file.id,
            fileName: file.name,
            targetProjectId: targetProject.id,
            targetProjectName: targetProject.name
        });
        this.trackActivity(targetProject.id, userId, project_features_dto_1.ActivityType.FILE_ADDED, {
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
    async getFilePermissions(fileId, userId) {
        const file = this.findFileById(fileId);
        if (!file) {
            throw new common_1.NotFoundException('File not found');
        }
        await this.validateFilePermission(fileId, userId, project_features_dto_1.FilePermission.VIEW);
        const hasSharePermission = await this.hasFilePermission(fileId, userId, project_features_dto_1.FilePermission.SHARE);
        if (!hasSharePermission) {
            const userPermissions = this.filePermissions.filter(p => p.fileId === fileId && p.userId === userId);
            return { userPermissions };
        }
        const allPermissions = this.filePermissions.filter(p => p.fileId === fileId);
        return { fileId, permissions: allPermissions };
    }
    async setFilePermissions(fileId, userId, permissions) {
        const file = this.findFileById(fileId);
        if (!file) {
            throw new common_1.NotFoundException('File not found');
        }
        const existingPermIndex = this.filePermissions.findIndex(p => p.fileId === fileId && p.userId === userId);
        if (existingPermIndex !== -1) {
            this.filePermissions.splice(existingPermIndex, 1);
        }
        const permissionRecord = {
            id: (0, uuid_1.v4)(),
            fileId,
            userId,
            permissions,
            createdAt: new Date().toISOString()
        };
        this.filePermissions.push(permissionRecord);
        return permissionRecord;
    }
    async updateFilePermissions(projectId, fileId, permissionsDto, userId) {
        const project = await this.getProjectById(projectId, userId);
        const file = await this.getProjectFile(projectId, fileId, userId);
        await this.validateFilePermission(fileId, userId, project_features_dto_1.FilePermission.SHARE);
        const updatedPermissions = [];
        for (const userPerm of permissionsDto.userPermissions) {
            const permRecord = await this.setFilePermissions(fileId, userPerm.userId, userPerm.permissions);
            updatedPermissions.push(permRecord);
        }
        this.trackActivity(projectId, userId, project_features_dto_1.ActivityType.FILE_PERMISSION_UPDATED, {
            fileId,
            fileName: file.name,
            updatedPermissions: permissionsDto.userPermissions
        });
        return { message: 'File permissions updated successfully', permissions: updatedPermissions };
    }
    async shareFileWithUser(projectId, fileId, shareDto, userId) {
        const project = await this.getProjectById(projectId, userId);
        const file = await this.getProjectFile(projectId, fileId, userId);
        await this.validateFilePermission(fileId, userId, project_features_dto_1.FilePermission.SHARE);
        const shareRecord = {
            id: (0, uuid_1.v4)(),
            fileId,
            sharedByUserId: userId,
            sharedWithUserId: shareDto.userId,
            permissions: shareDto.permissions,
            message: shareDto.message || '',
            expirationDate: shareDto.expirationDate ? new Date(shareDto.expirationDate).toISOString() : null,
            createdAt: new Date().toISOString()
        };
        this.userShares.push(shareRecord);
        await this.setFilePermissions(fileId, shareDto.userId, shareDto.permissions);
        const fileIndex = this.projectFiles.findIndex(f => f.id === fileId);
        if (fileIndex !== -1) {
            this.projectFiles[fileIndex].isShared = true;
        }
        this.trackActivity(projectId, userId, project_features_dto_1.ActivityType.FILE_SHARED, {
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
    async shareFileWithEmail(projectId, fileId, shareDto, userId) {
        const project = await this.getProjectById(projectId, userId);
        const file = await this.getProjectFile(projectId, fileId, userId);
        await this.validateFilePermission(fileId, userId, project_features_dto_1.FilePermission.SHARE);
        const shareRecord = {
            id: (0, uuid_1.v4)(),
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
        const fileIndex = this.projectFiles.findIndex(f => f.id === fileId);
        if (fileIndex !== -1) {
            this.projectFiles[fileIndex].isShared = true;
        }
        this.trackActivity(projectId, userId, project_features_dto_1.ActivityType.FILE_SHARED, {
            fileId,
            fileName: file.name,
            sharedWithEmail: shareDto.email,
            permissions: shareDto.permissions
        });
        return {
            message: 'File share invitation sent successfully',
            share: shareRecord
        };
    }
    async generateShareLink(projectId, fileId, shareLinkDto, userId) {
        const project = await this.getProjectById(projectId, userId);
        const file = await this.getProjectFile(projectId, fileId, userId);
        await this.validateFilePermission(fileId, userId, project_features_dto_1.FilePermission.SHARE);
        const token = crypto.randomBytes(32).toString('hex');
        let hashedPassword = null;
        if (shareLinkDto.password) {
            hashedPassword = await bcrypt.hash(shareLinkDto.password, 10);
        }
        const shareLink = {
            id: (0, uuid_1.v4)(),
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
        const fileIndex = this.projectFiles.findIndex(f => f.id === fileId);
        if (fileIndex !== -1) {
            this.projectFiles[fileIndex].isShared = true;
        }
        this.trackActivity(projectId, userId, project_features_dto_1.ActivityType.FILE_SHARED, {
            fileId,
            fileName: file.name,
            shareLink: true,
            permissions: shareLinkDto.permissions
        });
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
    async accessSharedFile(token, password) {
        const shareLink = this.shareLinks.find(link => link.token === token);
        if (!shareLink) {
            throw new common_1.NotFoundException('Share link not found or has expired');
        }
        if (shareLink.expirationDate) {
            const expirationDate = new Date(shareLink.expirationDate);
            if (expirationDate < new Date()) {
                throw new common_1.BadRequestException('Share link has expired');
            }
        }
        if (shareLink.maxUses !== null && shareLink.usesCount >= shareLink.maxUses) {
            throw new common_1.BadRequestException('Share link has reached its maximum number of uses');
        }
        if (shareLink.password) {
            if (!password) {
                throw new common_1.UnauthorizedException('Password is required to access this file');
            }
            const isPasswordValid = await bcrypt.compare(password, shareLink.password);
            if (!isPasswordValid) {
                throw new common_1.UnauthorizedException('Invalid password');
            }
        }
        const file = this.projectFiles.find(f => f.id === shareLink.fileId);
        if (!file) {
            throw new common_1.NotFoundException('File not found');
        }
        const shareLinkIndex = this.shareLinks.findIndex(link => link.token === token);
        if (shareLinkIndex !== -1) {
            this.shareLinks[shareLinkIndex].usesCount++;
        }
        if (shareLink.permissions.includes(project_features_dto_1.FilePermission.DOWNLOAD)) {
            try {
                const fileContent = fs.readFileSync(file.path);
                return Object.assign(Object.assign({}, file), { content: fileContent.toString('base64') });
            }
            catch (error) {
                throw new common_1.BadRequestException(`Failed to read file: ${error.message}`);
            }
        }
        else {
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
    async updateFileSizeLimit(limitDto) {
        if (!limitDto.affectedTypes && !limitDto.affectedFormats) {
            this.globalFileSizeLimit = limitDto.maxFileSize;
            return { message: 'Global file size limit updated successfully', limit: limitDto.maxFileSize };
        }
        const existingLimitIndex = this.fileSizeLimits.findIndex(limit => {
            const typesMatch = JSON.stringify(limit.affectedTypes) === JSON.stringify(limitDto.affectedTypes);
            const formatsMatch = JSON.stringify(limit.affectedFormats) === JSON.stringify(limitDto.affectedFormats);
            return typesMatch && formatsMatch;
        });
        if (existingLimitIndex !== -1) {
            this.fileSizeLimits[existingLimitIndex].maxFileSize = limitDto.maxFileSize;
            return {
                message: 'File size limit updated successfully',
                limit: this.fileSizeLimits[existingLimitIndex]
            };
        }
        else {
            const newLimit = {
                id: (0, uuid_1.v4)(),
                maxFileSize: limitDto.maxFileSize,
                affectedTypes: limitDto.affectedTypes || [],
                affectedFormats: limitDto.affectedFormats || [],
                createdAt: new Date().toISOString()
            };
            this.fileSizeLimits.push(newLimit);
            return { message: 'File size limit added successfully', limit: newLimit };
        }
    }
    async hasFilePermission(fileId, userId, permission) {
        const file = this.findFileById(fileId);
        if (file && file.uploadedBy === userId) {
            return true;
        }
        const userPermission = this.filePermissions.find(p => p.fileId === fileId && p.userId === userId);
        if (!userPermission) {
            return false;
        }
        if (userPermission.permissions.includes(project_features_dto_1.FilePermission.FULL_ACCESS)) {
            return true;
        }
        return userPermission.permissions.includes(permission);
    }
    async validateFilePermission(fileId, userId, permission) {
        const hasPermission = await this.hasFilePermission(fileId, userId, permission);
        if (!hasPermission) {
            throw new common_1.ForbiddenException(`You don't have ${permission} permission for this file`);
        }
    }
    findFileById(fileId) {
        return this.projectFiles.find(file => file.id === fileId);
    }
    detectFileFormat(filename) {
        const extension = filename.split('.').pop().toLowerCase();
        const formatMap = {
            'pdf': project_features_dto_1.FileFormat.PDF,
            'doc': project_features_dto_1.FileFormat.DOC,
            'docx': project_features_dto_1.FileFormat.DOCX,
            'xls': project_features_dto_1.FileFormat.XLS,
            'xlsx': project_features_dto_1.FileFormat.XLSX,
            'ppt': project_features_dto_1.FileFormat.PPT,
            'pptx': project_features_dto_1.FileFormat.PPTX,
            'txt': project_features_dto_1.FileFormat.TXT,
            'rtf': project_features_dto_1.FileFormat.RTF,
            'jpg': project_features_dto_1.FileFormat.JPG,
            'jpeg': project_features_dto_1.FileFormat.JPEG,
            'png': project_features_dto_1.FileFormat.PNG,
            'gif': project_features_dto_1.FileFormat.GIF,
            'bmp': project_features_dto_1.FileFormat.BMP,
            'svg': project_features_dto_1.FileFormat.SVG,
            'webp': project_features_dto_1.FileFormat.WEBP,
            'mp4': project_features_dto_1.FileFormat.MP4,
            'avi': project_features_dto_1.FileFormat.AVI,
            'mov': project_features_dto_1.FileFormat.MOV,
            'wmv': project_features_dto_1.FileFormat.WMV,
            'mkv': project_features_dto_1.FileFormat.MKV,
            'mp3': project_features_dto_1.FileFormat.MP3,
            'wav': project_features_dto_1.FileFormat.WAV,
            'ogg': project_features_dto_1.FileFormat.OGG,
            'flac': project_features_dto_1.FileFormat.FLAC,
            'zip': project_features_dto_1.FileFormat.ZIP,
            'rar': project_features_dto_1.FileFormat.RAR,
            'tar': project_features_dto_1.FileFormat.TAR,
            'gz': project_features_dto_1.FileFormat.GZIP,
        };
        return formatMap[extension] || project_features_dto_1.FileFormat.OTHER;
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map