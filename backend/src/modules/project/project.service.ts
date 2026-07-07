import { ProjectRepository } from './project.repository';
import { WorkspaceRepository } from '../workspace/workspace.repository';
import { ApiError } from '@/utils/ApiError';
import { CreateProjectDto, UpdateProjectDto, SaveSchemaDto } from './project.dto';

export class ProjectService {
  private projectRepository = new ProjectRepository();
  private workspaceRepository = new WorkspaceRepository();

  async createProject(workspaceId: string, creatorId: string, data: CreateProjectDto) {
    const workspace = await this.workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw new ApiError(404, 'Workspace not found');
    }

    return this.projectRepository.create(workspaceId, creatorId, data);
  }

  async getProject(projectId: string) {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new ApiError(404, 'Project not found');
    }
    return project;
  }

  async listProjects(workspaceId: string, includeArchived = false) {
    const workspace = await this.workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw new ApiError(404, 'Workspace not found');
    }

    return this.projectRepository.findAllInWorkspace(workspaceId, includeArchived);
  }

  async updateProject(projectId: string, data: UpdateProjectDto) {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new ApiError(404, 'Project not found');
    }

    return this.projectRepository.update(projectId, data);
  }

  async deleteProject(projectId: string) {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new ApiError(404, 'Project not found');
    }

    return this.projectRepository.delete(projectId);
  }

  async archiveProject(projectId: string) {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new ApiError(404, 'Project not found');
    }

    return this.projectRepository.archive(projectId);
  }

  async saveSchema(projectId: string, userId: string, data: SaveSchemaDto) {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new ApiError(404, 'Project not found');
    }

    return this.projectRepository.saveSchema(projectId, userId, data);
  }
}
