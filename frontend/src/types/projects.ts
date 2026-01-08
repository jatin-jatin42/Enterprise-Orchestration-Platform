import type { User } from './auth';
import type { Intern } from './intern';

// Base type for a team member, linking to User or Intern
export interface TeamMember {
  _id?: string;
  memberId: string | User | Intern; // Can be populated
  memberType: 'User' | 'Intern';
  name: string;
  role: string;
  joinedAt?: string;
}

// Manager type for project
export interface Manager {
  userId: string | User; // Can be populated
  name: string;
}

// Type for PDF documents attached to a project
export interface ProjectDocument {
  title: string;
  url: string;
  uploadedAt?: string;
  uploadedBy?: string | User; // Can be populated
  description?: string;
  filename?: string;
  originalName?: string;
  size?: number;
}

// Main Project interface, matching the backend model
export interface Project {
  _id: string;
  projectName: string;
  description?: string;
  status: 'Planning' | 'In Progress' | 'Completed' | 'On Hold';
  startDate?: string;
  endDate?: string;
  projectUrl?: string;
  repositoryUrl?: string;
  documentationUrl?: string;
  pdfDocuments?: ProjectDocument[];
  technologies?: string[];
  teamMembers?: TeamMember[];
  manager?: Manager;
  createdBy?: string | User;
  updatedBy?: string | User;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Type for creating a new project
export type CreateProjectData = Omit<
  Project,
  | '_id'
  | 'isActive'
  | 'createdAt'
  | 'updatedAt'
  | 'createdBy'
  | 'updatedBy'
  | 'pdfDocuments'
  | 'teamMembers'
  | 'manager'
>;

// Type for updating an existing project
export type UpdateProjectData = Partial<CreateProjectData>;

// Type for project list filters
export interface ProjectFilters {
  page: number;
  limit: number;
  search: string;
  status: 'Planning' | 'In Progress' | 'Completed' | 'On Hold' | '';
}

// Backend pagination response structure
export interface PaginationResponse<T> {
  data: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

// Type for assigning intern to project
export interface AssignInternData {
  internId: string;
  role: string;
  startDate?: string;
  endDate?: string;
}

// Type for updating project manager
export interface UpdateManagerData {
  userId: string;
  name?: string;
}

// Type for project intern response
export interface ProjectIntern {
  intern: {
    _id: string;
    personalInfo: any;
    internshipDetails: any;
  };
  role?: string;
  joinedAt?: string;
  memberId?: string;
}