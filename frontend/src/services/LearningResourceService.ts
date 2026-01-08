// services/LearningResourceService.ts
import { api } from './api';
import type {
  ResourceFilters,
  CreateResourceData,
  UpdateResourceData,
  LearningResource,
  LikeResourceResponse,
  PaginationResponse
} from '../types/learning-resource';

export interface ResourceListResponse {
  data: LearningResource[];
  pagination: PaginationResponse;
}

export interface ViewResourceResponse {
  success: boolean;
  message: string;
  views: number;
  viewIncremented?: boolean; // Add this
}

export const learningResourceService = {
  // ----------------------
  // GET ALL RESOURCES
  // ----------------------
  async getResources(filters: ResourceFilters): Promise<ResourceListResponse> {
    try {
      const res = await api.get('/learning-resources', { params: filters });

      // Ensure we always return a proper structure
      return {
        data: Array.isArray(res.data?.data) ? res.data.data : [],
        pagination: res.data?.pagination || {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: 10
        }
      };
    } catch (error) {
      console.error('Error fetching resources:', error);
      // Return empty structure on error
      return {
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: 10
        }
      };
    }
  },

  // ----------------------
  // GET SINGLE RESOURCE
  // ----------------------
  async getResource(id: string): Promise<LearningResource> {
    try {
      const res = await api.get(`/learning-resources/${id}`);
      return res.data.data; // Updated to match backend response structure
    } catch (error) {
      console.error(`Error fetching resource ${id}:`, error);
      throw error;
    }
  },

  // ----------------------
  // CREATE RESOURCE
  // ----------------------
  async createResource(data: CreateResourceData): Promise<LearningResource> {
    try {
      const res = await api.post('/learning-resources', data);
      return res.data.data; // Updated to match backend response structure
    } catch (error) {
      console.error('Error creating resource:', error);
      throw error;
    }
  },

  // ----------------------
  // UPDATE RESOURCE
  // ----------------------
  async updateResource(id: string, data: UpdateResourceData): Promise<LearningResource> {
    try {
      const res = await api.put(`/learning-resources/${id}`, data);
      return res.data.data; // Updated to match backend response structure
    } catch (error) {
      console.error(`Error updating resource ${id}:`, error);
      throw error;
    }
  },

  // ----------------------
  // DELETE RESOURCE
  // ----------------------
  async deleteResource(id: string): Promise<void> {
    try {
      await api.delete(`/learning-resources/${id}`);
    } catch (error) {
      console.error(`Error deleting resource ${id}:`, error);
      throw error;
    }
  },

  // ----------------------
  // LIKE RESOURCE
  // ----------------------
  async likeResource(id: string): Promise<LikeResourceResponse> {
    try {
      const res = await api.post(`/learning-resources/${id}/like`);
      return res.data; // Backend returns { success, message, likes, isLiked }
    } catch (error) {
      console.error(`Error liking resource ${id}:`, error);
      throw error;
    }
  },

  // ----------------------
  // TRACK VIEW - NEW METHOD
  // ----------------------
  async trackView(id: string): Promise<{ views: number; message: string }> {
    try {
      const res = await api.patch(`/learning-resources/${id}/view`);
      return {
        views: res.data.views || res.data.data?.views || 0,
        message: res.data.message || 'View tracked successfully'
      };
    } catch (error) {
      console.error(`Error tracking view for resource ${id}:`, error);
      throw error;
    }
  },


};