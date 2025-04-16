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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsController = void 0;
const common_1 = require("@nestjs/common");
const projects_service_1 = require("./projects.service");
const project_dto_1 = require("./dto/project.dto");
const project_features_dto_1 = require("./dto/project-features.dto");
let ProjectsController = class ProjectsController {
    constructor(projectsService) {
        this.projectsService = projectsService;
    }
    createProject(createProjectDto, userId) {
        return this.projectsService.createProject(createProjectDto, userId);
    }
    getProjects(userId) {
        return this.projectsService.getProjects(userId);
    }
    getProjectById(id, userId) {
        return this.projectsService.getProjectById(id, userId);
    }
    updateProject(id, updateProjectDto, userId) {
        return this.projectsService.updateProject(id, updateProjectDto, userId);
    }
    deleteProject(id, userId) {
        return this.projectsService.deleteProject(id, userId);
    }
    archiveProject(id, userId) {
        return this.projectsService.archiveProject(id, userId);
    }
    getProjectTags(id, userId) {
        return this.projectsService.getProjectTags(id, userId);
    }
    addProjectTag(id, tagDto, userId) {
        return this.projectsService.addProjectTag(id, tagDto, userId);
    }
    removeProjectTag(id, tagDto, userId) {
        return this.projectsService.removeProjectTag(id, tagDto, userId);
    }
    updateProjectTags(id, tagsDto, userId) {
        return this.projectsService.updateProjectTags(id, tagsDto, userId);
    }
    async getProjectFiles(projectId, userId, fileType) {
        return this.projectsService.getProjectFiles(projectId, userId, fileType);
    }
    async getProjectFile(projectId, fileId, userId) {
        return this.projectsService.getProjectFile(projectId, fileId, userId);
    }
    async addProjectFile(projectId, fileDto, userId) {
        return this.projectsService.addProjectFile(projectId, fileDto, userId);
    }
    async uploadProjectFile(projectId, fileUploadDto, userId) {
        return this.projectsService.uploadProjectFile(projectId, fileUploadDto, userId);
    }
    async downloadProjectFile(projectId, fileId, userId) {
        return this.projectsService.downloadProjectFile(projectId, fileId, userId);
    }
    async moveProjectFile(projectId, fileId, moveFileDto, userId) {
        return this.projectsService.moveProjectFile(projectId, fileId, moveFileDto, userId);
    }
    async updateProjectFile(projectId, fileId, updateDto, userId) {
        return this.projectsService.updateProjectFile(projectId, fileId, updateDto, userId);
    }
    async deleteProjectFile(projectId, fileId, userId) {
        return this.projectsService.deleteProjectFile(projectId, fileId, userId);
    }
    getProjectActivities(id, userId, limit) {
        return this.projectsService.getProjectActivities(id, userId, limit);
    }
    async getFilesByType(projectId, fileType, userId) {
        return this.projectsService.getProjectFiles(projectId, userId, fileType);
    }
    async getFilesByFormat(projectId, format, userId) {
        const files = await this.projectsService.getProjectFiles(projectId, userId);
        return files.filter(file => file.format === format);
    }
    async getFilePermissions(projectId, fileId, userId) {
        await this.projectsService.getProjectById(projectId, userId);
        return this.projectsService.getFilePermissions(fileId, userId);
    }
    async updateFilePermissions(projectId, fileId, permissionsDto, userId) {
        return this.projectsService.updateFilePermissions(projectId, fileId, permissionsDto, userId);
    }
    async shareFileWithUser(projectId, fileId, shareDto, userId) {
        return this.projectsService.shareFileWithUser(projectId, fileId, shareDto, userId);
    }
    async shareFileWithEmail(projectId, fileId, shareDto, userId) {
        return this.projectsService.shareFileWithEmail(projectId, fileId, shareDto, userId);
    }
    async generateShareLink(projectId, fileId, shareLinkDto, userId) {
        return this.projectsService.generateShareLink(projectId, fileId, shareLinkDto, userId);
    }
    async accessSharedFile(token, password) {
        return this.projectsService.accessSharedFile(token, password);
    }
    async updateFileSizeLimit(limitDto) {
        return this.projectsService.updateFileSizeLimit(limitDto);
    }
};
exports.ProjectsController = ProjectsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [project_dto_1.CreateProjectDto, String]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "createProject", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "getProjects", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "getProjectById", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, project_dto_1.UpdateProjectDto, String]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "updateProject", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "deleteProject", null);
__decorate([
    (0, common_1.Patch)(':id/archive'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "archiveProject", null);
__decorate([
    (0, common_1.Get)(':id/tags'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "getProjectTags", null);
__decorate([
    (0, common_1.Post)(':id/tags'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, project_features_dto_1.AddProjectTagDto, String]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "addProjectTag", null);
__decorate([
    (0, common_1.Delete)(':id/tags'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, project_features_dto_1.RemoveProjectTagDto, String]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "removeProjectTag", null);
__decorate([
    (0, common_1.Patch)(':id/tags'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, project_features_dto_1.ProjectTagsDto, String]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "updateProjectTags", null);
__decorate([
    (0, common_1.Get)(':id/files'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('userId')),
    __param(2, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "getProjectFiles", null);
__decorate([
    (0, common_1.Get)(':id/files/:fileId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('fileId')),
    __param(2, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "getProjectFile", null);
__decorate([
    (0, common_1.Post)(':id/files'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, project_features_dto_1.ProjectFileDto, String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "addProjectFile", null);
__decorate([
    (0, common_1.Post)(':id/files/upload'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, project_features_dto_1.FileUploadDto, String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "uploadProjectFile", null);
__decorate([
    (0, common_1.Get)(':id/files/:fileId/download'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('fileId')),
    __param(2, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "downloadProjectFile", null);
__decorate([
    (0, common_1.Post)(':id/files/:fileId/move'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('fileId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, project_features_dto_1.MoveFileDto, String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "moveProjectFile", null);
__decorate([
    (0, common_1.Patch)(':id/files/:fileId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('fileId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, project_features_dto_1.UpdateFileDto, String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "updateProjectFile", null);
__decorate([
    (0, common_1.Delete)(':id/files/:fileId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('fileId')),
    __param(2, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "deleteProjectFile", null);
__decorate([
    (0, common_1.Get)(':id/activities'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('userId')),
    __param(2, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "getProjectActivities", null);
__decorate([
    (0, common_1.Get)(':id/files/by-type/:type'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('type')),
    __param(2, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "getFilesByType", null);
__decorate([
    (0, common_1.Get)(':id/files/by-format/:format'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('format')),
    __param(2, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "getFilesByFormat", null);
__decorate([
    (0, common_1.Get)(':id/files/:fileId/permissions'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('fileId')),
    __param(2, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "getFilePermissions", null);
__decorate([
    (0, common_1.Patch)(':id/files/:fileId/permissions'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('fileId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, project_features_dto_1.UpdateFilePermissionsDto, String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "updateFilePermissions", null);
__decorate([
    (0, common_1.Post)(':id/files/:fileId/share/user'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('fileId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, project_features_dto_1.ShareFileWithUserDto, String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "shareFileWithUser", null);
__decorate([
    (0, common_1.Post)(':id/files/:fileId/share/email'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('fileId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, project_features_dto_1.ShareFileWithEmailDto, String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "shareFileWithEmail", null);
__decorate([
    (0, common_1.Post)(':id/files/:fileId/share/link'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('fileId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, project_features_dto_1.GenerateShareLinkDto, String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "generateShareLink", null);
__decorate([
    (0, common_1.Get)('shared/:token'),
    __param(0, (0, common_1.Param)('token')),
    __param(1, (0, common_1.Query)('password')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "accessSharedFile", null);
__decorate([
    (0, common_1.Post)('admin/file-size-limits'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [project_features_dto_1.FileSizeLimitDto]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "updateFileSizeLimit", null);
exports.ProjectsController = ProjectsController = __decorate([
    (0, common_1.Controller)('projects'),
    __metadata("design:paramtypes", [projects_service_1.ProjectsService])
], ProjectsController);
//# sourceMappingURL=projects.controller.js.map