import { api } from './api';
import type {
  PaginationResponse,
  Project,
  ProjectFilters,
  CreateProjectData,
  UpdateProjectData,
  AssignInternData,
  UpdateManagerData,
  ProjectIntern,
  ProjectDocument,
} from '../types/projects';

const getProjects = async (
  filters: Partial<ProjectFilters> = {}
): Promise<PaginationResponse<Project>> => {
  try {
    const { data } = await api.get('/projects', { params: filters });
    // Backend returns { success: true, data: [...], pagination: {...} }
    return {
      data: data.data,
      currentPage: data.pagination.currentPage,
      totalPages: data.pagination.totalPages,
      totalItems: data.pagination.totalItems,
      itemsPerPage: data.pagination.itemsPerPage,
    };
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Failed to fetch projects'
    );
  }
};

const getProject = async (id: string): Promise<Project> => {
  try {
    const { data } = await api.get(`/projects/${id}`);
    return data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch project');
  }
};

const createProject = async (
  projectData: CreateProjectData,
  documents?: File[]
): Promise<Project> => {
  try {
    let requestData: FormData | CreateProjectData = projectData;

    // If documents are provided, use FormData
    if (documents && documents.length > 0) {
      const formData = new FormData();
      
      // Append project fields
      Object.entries(projectData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'technologies' && Array.isArray(value)) {
            value.forEach((tech) => formData.append('technologies', tech));
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      // Append documents
      documents.forEach((file) => {
        formData.append('documents', file);
      });

      requestData = formData;
    }

    const { data } = await api.post('/projects', requestData, {
      headers: documents && documents.length > 0 
        ? { 'Content-Type': 'multipart/form-data' }
        : undefined,
    });
    return data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create project');
  }
};

const updateProject = async (
  id: string,
  projectData: UpdateProjectData,
  documents?: File[]
): Promise<Project> => {
  try {
    let requestData: FormData | UpdateProjectData = projectData;

    // If documents are provided, use FormData
    if (documents && documents.length > 0) {
      const formData = new FormData();
      
      // Append project fields
      Object.entries(projectData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'technologies' && Array.isArray(value)) {
            value.forEach((tech) => formData.append('technologies', tech));
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      // Append documents
      documents.forEach((file) => {
        formData.append('documents', file);
      });

      requestData = formData;
    }

    const { data } = await api.put(`/projects/${id}`, requestData, {
      headers: documents && documents.length > 0
        ? { 'Content-Type': 'multipart/form-data' }
        : undefined,
    });
    return data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update project');
  }
};

const deleteProject = async (id: string): Promise<void> => {
  try {
    await api.delete(`/projects/${id}`);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete project');
  }
};

// ============================
// TEAM MANAGEMENT
// ============================

const assignInternToProject = async (
  projectId: string,
  assignData: AssignInternData
): Promise<Project> => {
  try {
    const { data } = await api.post(
      `/projects/${projectId}/assign-intern`,
      assignData
    );
    return data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Failed to assign intern to project'
    );
  }
};

const removeInternFromProject = async (
  projectId: string,
  internId: string
): Promise<Project> => {
  try {
    const { data } = await api.delete(
      `/projects/${projectId}/unassign-intern`,
      { params: { internId } }
    );
    return data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Failed to remove intern from project'
    );
  }
};

const getProjectInterns = async (projectId: string): Promise<ProjectIntern[]> => {
  try {
    const { data } = await api.get(`/projects/${projectId}/interns`);
    return data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Failed to fetch project interns'
    );
  }
};

const updateProjectManager = async (
  projectId: string,
  managerData: UpdateManagerData
): Promise<Project> => {
  try {
    const { data } = await api.put(
      `/projects/${projectId}/manager`,
      managerData
    );
    return data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Failed to update project manager'
    );
  }
};

// ============================
// DOCUMENT MANAGEMENT
// ============================

const getProjectDocuments = async (projectId: string): Promise<ProjectDocument[]> => {
  try {
    const { data } = await api.get(`/projects/${projectId}/documents`);
    return data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Failed to fetch project documents'
    );
  }
};

const addProjectDocument = async (
  projectId: string,
  file: File,
  title: string,
  description?: string
): Promise<Project> => {
  try {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('title', title);
    if (description) {
      formData.append('description', description);
    }

    const { data } = await api.post(
      `/projects/${projectId}/documents`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Failed to add project document'
    );
  }
};

const removeProjectDocument = async (
  projectId: string,
  documentIndex: number
): Promise<void> => {
  try {
    await api.delete(`/projects/${projectId}/documents/${documentIndex}`);
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Failed to remove project document'
    );
  }
};

export const projectService = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  assignInternToProject,
  removeInternFromProject,
  getProjectInterns,
  updateProjectManager,
  getProjectDocuments,
  addProjectDocument,
  removeProjectDocument,
};






