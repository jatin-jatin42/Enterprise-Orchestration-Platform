import { create } from 'zustand';
import { projectService } from '../services/projectService';
import type {
  Project,
  ProjectFilters,
  CreateProjectData,
  UpdateProjectData,
  AssignInternData,
  UpdateManagerData,
  ProjectIntern,
  ProjectDocument,
} from '../types/projects';

// Define the state shape
export interface ProjectState {
  projects: Project[];
  selectedProject: Project | null;
  projectInterns: ProjectIntern[];
  projectDocuments: ProjectDocument[];
  filters: ProjectFilters;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
}

// Define the actions
export interface ProjectActions {
  fetchProjects: (filters?: Partial<ProjectFilters>) => Promise<void>;
  fetchProject: (id: string) => Promise<void>;
  createProject: (data: CreateProjectData, documents?: File[]) => Promise<Project | void>;
  updateProject: (id: string, data: UpdateProjectData, documents?: File[]) => Promise<Project | void>;
  deleteProject: (id: string) => Promise<void>;
  assignInternToProject: (projectId: string, assignData: AssignInternData) => Promise<void>;
  removeInternFromProject: (projectId: string, internId: string) => Promise<void>;
  fetchProjectInterns: (projectId: string) => Promise<void>;
  updateProjectManager: (projectId: string, managerData: UpdateManagerData) => Promise<void>;
  fetchProjectDocuments: (projectId: string) => Promise<void>;
  addProjectDocument: (projectId: string, file: File, title: string, description?: string) => Promise<void>;
  removeProjectDocument: (projectId: string, documentIndex: number) => Promise<void>;
  setFilters: (filters: Partial<ProjectFilters>) => void;
  clearError: () => void;
  reset: () => void;
}

// Create the store
const initialState: ProjectState = {
  projects: [],
  selectedProject: null,
  projectInterns: [],
  projectDocuments: [],
  filters: {
    page: 1,
    limit: 10,
    search: '',
    status: '',
  },
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 10,
  },
  status: 'idle',
  error: null,
};

export const useProjectStore = create<ProjectState & ProjectActions>((set, get) => ({
  ...initialState,

  // Actions
  fetchProjects: async (filters = {}) => {
    set({ status: 'loading', error: null });
    try {
      const currentFilters = get().filters;
      const mergedFilters = { ...currentFilters, ...filters };
      const response = await projectService.getProjects(mergedFilters);

      set({
        projects: response.data || [],
        pagination: {
          currentPage: response.currentPage,
          totalPages: response.totalPages,
          totalItems: response.totalItems,
          itemsPerPage: response.itemsPerPage,
        },
        filters: mergedFilters,
        status: 'success',
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch projects',
        status: 'error',
        projects: [],
      });
    }
  },

  fetchProject: async (id: string) => {
    set({ status: 'loading', error: null });
    try {
      const project = await projectService.getProject(id);
      set({ selectedProject: project, status: 'success' });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch project',
        status: 'error',
        selectedProject: null,
      });
    }
  },

  createProject: async (data: CreateProjectData, documents?: File[]) => {
    set({ status: 'loading', error: null });
    try {
      const newProject = await projectService.createProject(data, documents);
      set((state) => ({
        projects: [newProject, ...state.projects],
        status: 'success',
      }));
      // Refresh the list for consistency
      await get().fetchProjects(get().filters);
      return newProject;
    } catch (error: any) {
      set({ error: error.message || 'Failed to create project', status: 'error' });
      throw error; // Re-throw for form handling
    }
  },

  updateProject: async (id: string, data: UpdateProjectData, documents?: File[]) => {
    set({ status: 'loading', error: null });
    try {
      const updatedProject = await projectService.updateProject(id, data, documents);
      set((state) => ({
        projects: state.projects.map((p) =>
          p._id === id ? { ...p, ...updatedProject } : p
        ),
        selectedProject:
          state.selectedProject?._id === id
            ? { ...state.selectedProject, ...updatedProject }
            : state.selectedProject,
        status: 'success',
      }));
      return updatedProject;
    } catch (error: any) {
      set({ error: error.message || 'Failed to update project', status: 'error' });
      throw error; // Re-throw for form handling
    }
  },

  deleteProject: async (id: string) => {
    set({ status: 'loading', error: null });
    try {
      await projectService.deleteProject(id);
      set((state) => ({
        projects: state.projects.filter((p) => p._id !== id),
        selectedProject:
          state.selectedProject?._id === id ? null : state.selectedProject,
        status: 'success',
      }));
      // Refresh list to fix pagination
      await get().fetchProjects(get().filters);
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete project', status: 'error' });
      throw error;
    }
  },

  assignInternToProject: async (projectId, assignData) => {
    set({ status: 'loading', error: null });
    try {
      const updatedProject = await projectService.assignInternToProject(
        projectId,
        assignData
      );
      set((state) => ({
        projects: state.projects.map((p) =>
          p._id === projectId ? updatedProject : p
        ),
        selectedProject:
          state.selectedProject?._id === projectId
            ? updatedProject
            : state.selectedProject,
        status: 'success',
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to assign intern to project', status: 'error' });
      throw error;
    }
  },

  removeInternFromProject: async (projectId, internId) => {
    set({ status: 'loading', error: null });
    try {
      const updatedProject = await projectService.removeInternFromProject(
        projectId,
        internId
      );
      set((state) => ({
        projects: state.projects.map((p) =>
          p._id === projectId ? updatedProject : p
        ),
        selectedProject:
          state.selectedProject?._id === projectId
            ? updatedProject
            : state.selectedProject,
        status: 'success',
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Failed to remove intern from project',
        status: 'error',
      });
      throw error;
    }
  },

  fetchProjectInterns: async (projectId: string) => {
    set({ status: 'loading', error: null });
    try {
      const interns = await projectService.getProjectInterns(projectId);
      set({ projectInterns: interns, status: 'success' });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch project interns',
        status: 'error',
        projectInterns: [],
      });
    }
  },

  updateProjectManager: async (projectId: string, managerData: UpdateManagerData) => {
    set({ status: 'loading', error: null });
    try {
      const updatedProject = await projectService.updateProjectManager(
        projectId,
        managerData
      );
      set((state) => ({
        projects: state.projects.map((p) =>
          p._id === projectId ? updatedProject : p
        ),
        selectedProject:
          state.selectedProject?._id === projectId
            ? updatedProject
            : state.selectedProject,
        status: 'success',
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Failed to update project manager',
        status: 'error',
      });
      throw error;
    }
  },

  fetchProjectDocuments: async (projectId: string) => {
    set({ status: 'loading', error: null });
    try {
      const documents = await projectService.getProjectDocuments(projectId);
      set({ projectDocuments: documents, status: 'success' });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch project documents',
        status: 'error',
        projectDocuments: [],
      });
    }
  },

  addProjectDocument: async (
    projectId: string,
    file: File,
    title: string,
    description?: string
  ) => {
    set({ status: 'loading', error: null });
    try {
      const updatedProject = await projectService.addProjectDocument(
        projectId,
        file,
        title,
        description
      );
      set((state) => ({
        projects: state.projects.map((p) =>
          p._id === projectId ? updatedProject : p
        ),
        selectedProject:
          state.selectedProject?._id === projectId
            ? updatedProject
            : state.selectedProject,
        status: 'success',
      }));
      // Refresh documents list
      await get().fetchProjectDocuments(projectId);
    } catch (error: any) {
      set({
        error: error.message || 'Failed to add project document',
        status: 'error',
      });
      throw error;
    }
  },

  removeProjectDocument: async (projectId: string, documentIndex: number) => {
    set({ status: 'loading', error: null });
    try {
      await projectService.removeProjectDocument(projectId, documentIndex);
      set({ status: 'success' });
      // Refresh project and documents to get updated state
      await get().fetchProject(projectId);
      await get().fetchProjectDocuments(projectId);
    } catch (error: any) {
      set({
        error: error.message || 'Failed to remove project document',
        status: 'error',
      });
      throw error;
    }
  },

  setFilters: (filters: Partial<ProjectFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
    // Auto-fetch when filters change
    get().fetchProjects(filters);
  },

  clearError: () => set({ error: null }),

  reset: () => set(initialState),
}));