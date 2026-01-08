import type { BaseEntity, PaginationParams, PaginationResponse, InternStatus, ProjectStatus } from './index';

export type CommentStatus = 'Completed' | 'In Progress' | 'Blocked';
export type MeetingStatus = 'In Progress' | 'Completed' | 'On Hold';

export interface Mentor {
  userId: string;
  name: string;
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profileImage?: string;
  dateOfBirth?: string;
  address?: string;
}

export interface InternshipDetails {
  startDate: string;
  endDate?: string;
  duration?: string;
  department?: string;
  position?: string;
  mentor?: Mentor;
  status: InternStatus;
}

export interface ProjectTeamMember {
  memberId: string;
  memberType: 'User' | 'Intern';
  name: string;
  role: string;
}

export interface AssignedProject {
  projectId?: string;
  projectName?: string;
  role?: string;
  startDate?: string;
  endDate?: string;
  status?: MeetingStatus;
  projectUrl?: string;
  pdfUrl?: string;
  description?: string;
  technologies?: string[];
  teamMembers?: ProjectTeamMember[];
}

export interface DailyCommentAddedBy {
  userId: string;
  userName: string;
  role: string;
  email?: string;
}

export interface DailyComment {
  _id?: string;
  date: string;
  comment: string;
  taskDescription?: string;
  hoursWorked?: number;
  status?: CommentStatus;
  addedBy: DailyCommentAddedBy;
  createdAt?: string;
}

export interface MeetingNoteAddedBy {
  userId: string;
  userName: string;
  role: string;
}

export interface MeetingNote {
  _id?: string;
  date: string;
  title?: string;
  agenda?: string;
  notes: string;
  attendees?: string[];
  actionItems?: string[];
  nextMeetingDate?: string;
  addedBy: MeetingNoteAddedBy;
  createdAt?: string;
}

export interface Skills {
  technical?: string[];
  soft?: string[];
  learning?: string[];
}

// export interface PerformanceReview {
//   reviewDate?: string;
//   rating?: number;
//   feedback?: string;
//   reviewedBy?: {
//     userId: string;
//     name: string;
//   };
// }

// export interface Performance {
//   overallRating?: number;
//   punctuality?: number;
//   codeQuality?: number;
//   communication?: number;
//   teamwork?: number;
//   lastReviewDate?: string;
//   reviews?: PerformanceReview[];
// }

export interface Document {
  documentType?: 'Resume' | 'Certificate' | 'ID Proof' | 'Offer Letter' | 'Other';
  documentUrl: string;
  uploadedAt?: string;
  uploadedBy?: string;
}

export interface Intern extends BaseEntity {
  personalInfo: PersonalInfo;
  internshipDetails: InternshipDetails;
  projects?: AssignedProject[];
  dailyComments?: DailyComment[];
  meetingNotes?: MeetingNote[];
  skills?: Skills;
  performance?: Performance;
  documents?: Document[];
  isActive: boolean;
  createdBy?: string;
  updatedBy?: string;
}

export interface InternFilters extends PaginationParams {
  status?: InternStatus | '';
  department?: string;
  search?: string;
  mentor?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateInternData {
  personalInfo: PersonalInfo;
  internshipDetails: Omit<InternshipDetails, 'mentor'> & {
    mentor?: Mentor;
  };
  projects?: AssignedProject[];
}

export interface UpdateInternData {
  personalInfo?: Partial<PersonalInfo>;
  internshipDetails?: Partial<InternshipDetails>;
  projects?: AssignedProject[];
  skills?: Skills;
  performance?: Partial<Performance>;
}

export interface AddCommentData {
  date: string;
  comment: string;
  taskDescription?: string;
  hoursWorked?: number;
  status?: CommentStatus;
  addedBy: DailyCommentAddedBy;
}

export interface AddMeetingNoteData {
  date: string;
  title?: string;
  agenda?: string;
  notes: string;
  attendees?: string[];
  actionItems?: string[];
  nextMeetingDate?: string;
  addedBy: MeetingNoteAddedBy;
}

export interface AddProjectData {
  projectName?: string;
  description?: string;
  role?: string;
  startDate?: string;
  endDate?: string;
  status?: MeetingStatus;
  projectUrl?: string;
  technologies?: string[];
  teamMembers?: ProjectTeamMember[];
}

export interface InternState {
  interns: Intern[];
  selectedIntern: Intern | null;
  filters: InternFilters;
  pagination: PaginationResponse;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
}



export interface DailyCommentAddedBy {
  userId: string;
  userName: string;
  role: string;
  email?: string;
}


// Add these interfaces to your existing types file


export interface PerformanceReview {
  _id?: string; // Add this for consistency
  reviewDate?: string;
  rating?: number;
  feedback?: string;
  reviewedBy?: {
    userId: string;
    name: string;
  };
}

export interface Performance {
  overallRating?: number;
  punctuality?: number;
  codeQuality?: number;
  communication?: number;
  teamwork?: number;
  lastReviewDate?: string;
  reviews?: PerformanceReview[];
}

export interface AddPerformanceReviewData {
  overallRating?: number;
  punctuality?: number;
  codeQuality?: number;
  communication?: number;
  teamwork?: number;
  rating?: number;
  feedback?: string;
  reviewDate?: string;
  reviewedBy?: {
    userId: string;
    name: string;
  };
}

export interface UpdatePerformanceReviewData extends Partial<AddPerformanceReviewData> {}
