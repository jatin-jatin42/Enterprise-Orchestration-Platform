import { api } from './api';
import type { 
  Intern, 
  CreateInternData, 
  UpdateInternData, 
  AddCommentData,
  AddMeetingNoteData,
  AddProjectData,
  ApiResponse,
  ListResponse,
  InternFilters, 
  AddPerformanceReviewData
} from '../types';

export const internService = {
  getInterns: async (filters?: InternFilters): Promise<ListResponse<Intern>> => {
    const response = await api.get<ListResponse<Intern>>('/interns', { 
      params: filters 
    });
    return response.data;
  },

  getIntern: async (id: string): Promise<Intern> => {
    const response = await api.get<ApiResponse<Intern>>(`/interns/${id}`);
    return response.data.data;
  },

  createIntern: async (data: CreateInternData): Promise<Intern> => {
    const response = await api.post<ApiResponse<Intern>>('/interns', data);
    return response.data.data;
  },

  updateIntern: async (id: string, data: UpdateInternData): Promise<Intern> => {
    const response = await api.put<ApiResponse<Intern>>(`/interns/${id}`, data);
    return response.data.data;
  },

  deleteIntern: async (id: string): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/interns/${id}`);
  },

  addComment: async (id: string, data: AddCommentData): Promise<void> => {
    await api.post<ApiResponse<void>>(`/interns/${id}/comments`, data);
  },

  addMeetingNote: async (id: string, data: AddMeetingNoteData): Promise<void> => {
    await api.post<ApiResponse<void>>(`/interns/${id}/meeting-notes`, data);
  },

  addProject: async (id: string, data: AddProjectData): Promise<void> => {
    await api.post<ApiResponse<void>>(`/interns/${id}/projects`, data);
  },

   addPerformanceReview: async (id: string, data: AddPerformanceReviewData): Promise<void> => {
    await api.post<ApiResponse<void>>(`/interns/${id}/performance`, data);
  },

  updatePerformanceReview: async (
    id: string, 
    reviewId: string, 
    data: Partial<AddPerformanceReviewData>
  ): Promise<void> => {
    await api.put<ApiResponse<void>>(`/interns/${id}/performance/reviews/${reviewId}`, data);
  },

  getPerformance: async (id: string): Promise<Performance> => {
    const response = await api.get<ApiResponse<Performance>>(`/interns/${id}/performance`);
    return response.data.data;
  },


  
};