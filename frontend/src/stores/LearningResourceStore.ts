// stores/LearningResourceStore.ts - Complete updated version
import { create } from 'zustand';
import { learningResourceService } from '../services/LearningResourceService';
import { useAuthStore } from './authStore';
import type {
  LearningResource,
  ResourceFilters,
  CreateResourceData,
  UpdateResourceData,
  ResourceState
} from '../types';

interface LearningResourceStore extends ResourceState {
  // Actions
  fetchResources: (filters?: ResourceFilters) => Promise<void>;
  fetchResource: (id: string) => Promise<void>;
  createResource: (data: CreateResourceData) => Promise<void>;
  updateResource: (id: string, data: UpdateResourceData) => Promise<void>;
  deleteResource: (id: string) => Promise<void>;
  likeResource: (id: string) => Promise<void>;
  viewResource: (id: string) => Promise<void>;
  setFilters: (filters: Partial<ResourceFilters>) => void;
  clearSelected: () => void;
  clearError: () => void;
}

// Create stable function references outside the store to prevent recreation
const createStoreActions = (set: any, get: any) => ({
  
  // ----------------------
  // FETCH RESOURCES - UPDATED WITH LOCAL STORAGE
  // ----------------------
  fetchResources: async (filters?: ResourceFilters) => {
    set({ status: 'loading', error: null });
    try {
      const currentFilters = filters || get().filters;
      const response = await learningResourceService.getResources(currentFilters);

      const { user } = useAuthStore.getState();

      // FIXED: Properly sync with local storage for persistent state
      const resourcesWithLocalStatus = response.data.map(resource => {
        // For unauthenticated users, use local storage as backup
        if (!user) {
          // Check local storage for view status - FIXED
          const viewedResources = JSON.parse(localStorage.getItem('viewedResources') || '{}');
          const hasViewedLocal = !!viewedResources[resource._id];

          // Check local storage for like status - FIXED
          const likedResources = JSON.parse(localStorage.getItem('likedResources') || '{}');
          const isLikedLocal = !!likedResources[resource._id];

          return {
            ...resource,
            hasViewed: resource.hasViewed || hasViewedLocal,
            isLiked: resource.isLiked || isLikedLocal
          };
        }
        return resource;
      });

      set({
        resources: Array.isArray(resourcesWithLocalStatus) ? resourcesWithLocalStatus : [],
        pagination: response.pagination || {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: 10
        },
        status: 'success',
        filters: currentFilters
      });
    } catch (error: any) {
      const errorMessage = error?.response?.status === 403
        ? 'You do not have permission to access these resources'
        : error?.message || 'Failed to fetch resources';

      set({
        status: 'error',
        error: errorMessage
      });
    }
  },



  fetchResource: async (id: string) => {
    set({ status: 'loading', error: null });
    try {
      const resource = await learningResourceService.getResource(id);
      set({
        selectedResource: resource,
        status: 'success'
      });
    } catch (error: any) {
      const errorMessage = error?.response?.status === 403
        ? 'You do not have permission to view this resource'
        : error?.message || 'Failed to fetch resource';

      set({
        status: 'error',
        error: errorMessage
      });
    }
  },

  createResource: async (data: CreateResourceData) => {
    set({ status: 'loading', error: null });
    try {
      const newResource = await learningResourceService.createResource(data);
      set((state: ResourceState) => ({
        resources: [newResource, ...state.resources],
        status: 'success'
      }));
    } catch (error: any) {
      const errorMessage = error?.response?.status === 403
        ? 'You do not have permission to create resources'
        : error?.message || 'Failed to create resource';

      set({
        status: 'error',
        error: errorMessage
      });
      throw error;
    }
  },

  updateResource: async (id: string, data: UpdateResourceData) => {
    set({ status: 'loading', error: null });
    try {
      const updatedResource = await learningResourceService.updateResource(id, data);
      set((state: ResourceState) => ({
        resources: state.resources.map(resource =>
          resource._id === id ? updatedResource : resource
        ),
        selectedResource: state.selectedResource?._id === id ? updatedResource : state.selectedResource,
        status: 'success'
      }));
    } catch (error: any) {
      const errorMessage = error?.response?.status === 403
        ? 'You can only edit your own resources'
        : error?.message || 'Failed to update resource';

      set({
        status: 'error',
        error: errorMessage
      });
      throw error;
    }
  },

  deleteResource: async (id: string) => {
    set({ status: 'loading', error: null });
    try {
      await learningResourceService.deleteResource(id);
      set((state: ResourceState) => ({
        resources: state.resources.filter(resource => resource._id !== id),
        selectedResource: state.selectedResource?._id === id ? null : state.selectedResource,
        status: 'success'
      }));
    } catch (error: any) {
      const errorMessage = error?.response?.status === 403
        ? 'You can only delete your own resources'
        : error?.message || 'Failed to delete resource';

      set({
        status: 'error',
        error: errorMessage
      });
      throw error;
    }
  },

  // ----------------------
  // VIEW RESOURCE - UPDATED WITH LOCAL STORAGE
  // ----------------------
  viewResource: async (id: string) => {
    try {
      // Check local storage first to prevent duplicate tracking
      const { user } = useAuthStore.getState();

      if (!user) {
        const hasViewed = get().trackLocalView(id);
        if (hasViewed) {
          // Already viewed in local storage, don't call API
          return;
        }
      }

      const response = await learningResourceService.trackView(id);

      // Update local storage for unauthenticated users
      if (!user) {
        const viewedResources = JSON.parse(localStorage.getItem('viewedResources') || '{}');
        viewedResources[id] = Date.now();
        localStorage.setItem('viewedResources', JSON.stringify(viewedResources));
      }

      set((state: ResourceState) => ({
        resources: state.resources.map(resource =>
          resource._id === id ? {
            ...resource,
            views: response.views,
            hasViewed: true
          } : resource
        ),
        selectedResource: state.selectedResource?._id === id
          ? {
            ...state.selectedResource,
            views: response.views,
            hasViewed: true
          }
          : state.selectedResource
      }));
    } catch (error: any) {
      console.error('Error tracking view:', error);
      // Don't show error to user for view tracking failures
    }
  },

  // ----------------------
  // LIKE RESOURCE - UPDATED WITH LOCAL STORAGE
  // ----------------------
  likeResource: async (id: string) => {
    try {
      const response = await learningResourceService.likeResource(id);

      

      // Update local storage for persistence
      const { user } = useAuthStore.getState();
      if (!user) {
        const likedResources = JSON.parse(localStorage.getItem('likedResources') || '{}');
        likedResources[id] = response.isLiked;
        localStorage.setItem('likedResources', JSON.stringify(likedResources));
        console.log('Updated localStorage for like:', { id, isLiked: response.isLiked }); // Debug log
      }

      set((state: ResourceState) => ({
        resources: state.resources.map(resource =>
          resource._id === id ? {
            ...resource,
            likes: response.likes,
            isLiked: response.isLiked // Make sure this is set
          } : resource
        ),
        selectedResource: state.selectedResource?._id === id
          ? {
            ...state.selectedResource,
            likes: response.likes,
            isLiked: response.isLiked
          }
          : state.selectedResource
      }));

      

    } catch (error: any) {
      console.error('Like error:', error); // Debug log
      const errorMessage = error?.response?.status === 403
        ? 'Unable to like resource'
        : error?.message || 'Failed to like resource';

      set({
        error: errorMessage
      });
      throw error;
    }
  },

  setFilters: (filters: Partial<ResourceFilters>) => {
    set((state: ResourceState) => ({
      filters: { ...state.filters, ...filters }
    }));
  },

  clearSelected: () => {
    set({ selectedResource: null });
  },

  clearError: () => {
    set({ error: null });
  }
});

export const useLearningResourceStore = create<LearningResourceStore>((set, get) => ({
  // Initial state
  resources: [],
  selectedResource: null,
  filters: {
    page: 1,
    limit: 10,
    category: '',
    difficulty: '',
    search: '',
    featured: false
  },
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 10
  },
  status: 'idle',
  error: null,

  // Actions - using the stable function references
  ...createStoreActions(set, get)
}));