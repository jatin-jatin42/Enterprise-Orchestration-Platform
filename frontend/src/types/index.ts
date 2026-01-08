// Base interfaces and types
export interface BaseEntity {
  _id: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: PaginationResponse;
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Common enums
export const InternStatus = {
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
  ON_LEAVE: 'On Leave',
  TERMINATED: 'Terminated',
} as const;

export type InternStatus = typeof InternStatus[keyof typeof InternStatus];

export const ResourceCategory = {
  TUTORIAL: 'Tutorial',
  ARTICLE: 'Article',
  VIDEO: 'Video',
  COURSE: 'Course',
  DOCUMENTATION: 'Documentation',
  TOOL: 'Tool',
  BOOK: 'Book',
} as const;

export type ResourceCategory = typeof ResourceCategory[keyof typeof ResourceCategory];

export const DifficultyLevel = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
} as const;

export type DifficultyLevel = typeof DifficultyLevel[keyof typeof DifficultyLevel];

export const UserRole = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export const ProjectStatus = {
  PLANNING: 'Planning',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  ON_HOLD: 'On Hold',
} as const;

export type ProjectStatus = typeof ProjectStatus[keyof typeof ProjectStatus];

// Type guards
export const isInternStatus = (status: string): status is InternStatus => {
  return Object.values(InternStatus).includes(status as InternStatus);
};

export const isResourceCategory = (category: string): category is ResourceCategory => {
  return Object.values(ResourceCategory).includes(category as ResourceCategory);
};

export const isUserRole = (role: string): role is UserRole => {
  return Object.values(UserRole).includes(role as UserRole);
};

// Re-export all other types
export * from './auth';
export * from './intern';
export * from './learning-resource';
export * from './user';
export * from './dashboard';
export * from './api';
export * from './form';
export * from './notification';
export * from './components';
export * from './projects';