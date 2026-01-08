// frontend/src/services/toolService.ts
import {api} from './api';

export interface Tool {
  _id?: string;
  id?: string;
  toolName: string;
  category: string;
  pricing: string;
  description: string;
  tags: string[];
  rating: number;
  officialUrl: string;
  documentationUrl?: string;
  isActive?: boolean;
  createdBy?: {
    userId: string;
    userName: string;
    email: string;
  };
  updatedBy?: {
    userId: string;
    userName: string;
    email: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateToolData {
  toolName: string;
  description: string;
  category: string;
  pricing: string;
  officialUrl: string;
  rating: number;
  documentationUrl?: string;
  tags: string;
}

export interface UpdateToolData extends CreateToolData {}

export interface ToolsResponse {
  success: boolean;
  data: Tool[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface ToolResponse {
  success: boolean;
  data: Tool;
}

class ToolService {
  // Get all tools with optional filters
  async getAllTools(filters?: {
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ToolsResponse> {
    const params = new URLSearchParams();
    
    if (filters?.category && filters.category !== 'All Categories') {
      params.append('category', filters.category);
    }
    if (filters?.search) {
      params.append('search', filters.search);
    }
    if (filters?.page) {
      params.append('page', filters.page.toString());
    }
    if (filters?.limit) {
      params.append('limit', filters.limit.toString());
    }

    const response = await api.get(`/tools?${params.toString()}`);
    return response.data;
  }

  // Get tool by ID
  async getToolById(id: string): Promise<ToolResponse> {
    const response = await api.get(`/tools/${id}`);
    return response.data;
  }

  // Create new tool
  async createTool(toolData: CreateToolData): Promise<ToolResponse> {
    // Convert tags string to array
    const tagsArray = toolData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    
    const payload = {
      toolName: toolData.toolName,
      description: toolData.description,
      category: toolData.category,
      pricing: toolData.pricing,
      officialUrl: toolData.officialUrl,
      rating: toolData.rating,
      documentationUrl: toolData.documentationUrl || '',
      tags: tagsArray
    };

    const response = await api.post('/tools', payload);
    return response.data;
  }

  // Update tool
  async updateTool(id: string, toolData: UpdateToolData): Promise<ToolResponse> {
    // Convert tags string to array
    const tagsArray = toolData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    
    const payload = {
      toolName: toolData.toolName,
      description: toolData.description,
      category: toolData.category,
      pricing: toolData.pricing,
      officialUrl: toolData.officialUrl,
      rating: toolData.rating,
      documentationUrl: toolData.documentationUrl || '',
      tags: tagsArray
    };

    const response = await api.put(`/tools/${id}`, payload);
    return response.data;
  }

  // Delete tool (soft delete)
  async deleteTool(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/tools/${id}`);
    return response.data;
  }
}

export default new ToolService();