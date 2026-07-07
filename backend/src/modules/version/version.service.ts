import { VersionRepository } from './version.repository';
import { ProjectRepository } from '../project/project.repository';
import { ApiError } from '@/utils/ApiError';

export class VersionService {
  private versionRepository = new VersionRepository();
  private projectRepository = new ProjectRepository();

  async createSnapshot(
    projectId: string,
    userId: string,
    data: {
      label?: string | null;
      description?: string | null;
      isAuto?: boolean;
    }
  ) {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new ApiError(404, 'Project not found');
    }

    if (!project.schema) {
      throw new ApiError(404, 'Schema not found for this project');
    }

    return this.versionRepository.create({
      projectId,
      label: data.label,
      description: data.description,
      canvasState: project.schema.canvasState,
      createdBy: userId,
      isAuto: data.isAuto ?? false,
    });
  }

  async listVersions(projectId: string) {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new ApiError(404, 'Project not found');
    }

    return this.versionRepository.findManyForProject(projectId);
  }

  async getVersion(versionId: string) {
    const version = await this.versionRepository.findById(versionId);
    if (!version) {
      throw new ApiError(404, 'Version snapshot not found');
    }
    return version;
  }

  async pruneAutoSnapshots(projectId: string) {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new ApiError(404, 'Project not found');
    }

    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - 30);

    return this.versionRepository.deleteManyOlderThan(projectId, thresholdDate);
  }
}
