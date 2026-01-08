import type {
  BaseEntity,
  PaginationParams,
  ResourceCategory,
  DifficultyLevel
} from './index';

// ---------------------------------------------
// USER REF (frontend-friendly)
// ---------------------------------------------
export interface UserRef {
  userId: string;
  userName: string;
  email: string;
}

// ---------------------------------------------
// LEARNING RESOURCE (Fully Updated + Correct)
// ---------------------------------------------
export interface LearningResource {
  _id: string;
  title: string;
  description: string;
  url: string;
  category: ResourceCategory;
  difficulty: DifficultyLevel;
  tags: string[];
  views: number;
  likes: number;
  isLiked?: boolean; // For like status
  hasViewed?: boolean; // Add this for view status
  createdBy: {
    userId: string;
    userName: string;
    email: string;
  };
  updatedBy?: {
    userId: string;
    userName: string;
    email: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------
// FILTERS
// ---------------------------------------------
export interface ResourceFilters extends PaginationParams {
  category?: ResourceCategory | '';
  difficulty?: DifficultyLevel | '';
  tags?: string[];
  search?: string;
  isActive?: boolean;
}

// ---------------------------------------------
// CREATE RESOURCE DATA
// ---------------------------------------------
export interface CreateResourceData {
  title: string;
  description?: string;
  category: ResourceCategory;
  url: string;
  tags?: string[];
  difficulty: DifficultyLevel;
}

// ---------------------------------------------
// UPDATE RESOURCE DATA
// ---------------------------------------------
export interface UpdateResourceData {
  title?: string;
  description?: string;
  category?: ResourceCategory;
  url?: string;
  tags?: string[];
  difficulty?: DifficultyLevel;
  isActive?: boolean;
}

// ---------------------------------------------
// LIKE RESPONSE
// ---------------------------------------------
export interface LikeResourceResponse {
  success: boolean;
  message: string;
  likes: number;
  isLiked: boolean; // Changed from hasLiked to isLiked to match backend response
}

// ---------------------------------------------
// PAGINATION RESPONSE
// ---------------------------------------------
export interface PaginationResponse {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

// ---------------------------------------------
// GLOBAL RESOURCE STATE
// ---------------------------------------------
export interface ResourceState {
  resources: LearningResource[];
  selectedResource: LearningResource | null;
  filters: ResourceFilters;
  pagination: PaginationResponse;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
}
