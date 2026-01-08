import { create } from "zustand";
import { internService } from "../services/internService";
import type {
  InternState,
  InternFilters,
  CreateInternData,
  UpdateInternData,
  Intern,
  AddCommentData,
  AddMeetingNoteData,
  DailyComment,
  MeetingNote,
  AddPerformanceReviewData,
} from "../types";

interface InternStore extends InternState {
  // Core CRUD operations
  fetchInterns: (filters?: Partial<InternFilters>) => Promise<void>;
  fetchIntern: (id: string) => Promise<void>;
  createIntern: (data: CreateInternData) => Promise<void>;
  updateIntern: (id: string, data: UpdateInternData) => Promise<void>;
  deleteIntern: (id: string) => Promise<void>;
  
  // Comment operations
  addComment: (
    internId: string,
    commentData: Omit<AddCommentData, "addedBy">
  ) => Promise<void>;
  updateComment: (
    internId: string,
    commentId: string,
    commentData: Partial<AddCommentData>
  ) => Promise<void>;
  deleteComment: (internId: string, commentId: string) => Promise<void>;
  
  // Meeting note operations
  addMeetingNote: (
    internId: string,
    meetingData: Omit<AddMeetingNoteData, "addedBy">
  ) => Promise<void>;
  updateMeetingNote: (
    internId: string,
    meetingId: string,
    meetingData: Partial<AddMeetingNoteData>
  ) => Promise<void>;
  deleteMeetingNote: (internId: string, meetingId: string) => Promise<void>;
  
  // Performance review operations
  addPerformanceReview: (
    internId: string,
    reviewData: AddPerformanceReviewData
  ) => Promise<void>;
  updatePerformanceReview: (
    internId: string,
    reviewId: string,
    reviewData: Partial<AddPerformanceReviewData>
  ) => Promise<void>;
  fetchPerformance: (internId: string) => Promise<void>;
  
  // Utility operations
  setFilters: (filters: Partial<InternFilters>) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState: InternState = {
  interns: [],
  selectedIntern: null,
  filters: {
    page: 1,
    limit: 10,
    search: "",
    status: "",
    department: "",
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  },
  status: "idle",
  error: null,
};

export const useInternStore = create<InternStore>((set, get) => ({
  // Initial state
  ...initialState,

  // Actions
  fetchInterns: async (filters = {}) => {
    set({ status: "loading", error: null });

    try {
      const currentFilters = get().filters;
      const mergedFilters = {
        ...currentFilters,
        ...filters,
        page: filters.page || currentFilters.page,
      };

      const response = await internService.getInterns(mergedFilters);

      set({
        interns: response.data || [],
        pagination: response.pagination || {
          page: mergedFilters.page,
          limit: mergedFilters.limit,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
        filters: mergedFilters,
        status: "success",
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch interns";
      console.error("Error fetching interns:", error);
      set({
        error: errorMessage,
        status: "error",
        interns: [], // Reset interns on error
      });
    }
  },

  fetchIntern: async (id: string) => {
    if (!id) {
      set({ error: "Invalid intern ID", status: "error" });
      return;
    }

    set({ status: "loading", error: null });

    try {
      const intern = await internService.getIntern(id);
      console.log("Fetched intern:", intern);
      set({ selectedIntern: intern, status: "success" });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch intern";
      console.error("Error fetching intern:", error);
      set({
        error: errorMessage,
        status: "error",
        selectedIntern: null,
      });
    }
  },

  createIntern: async (data: CreateInternData) => {
    set({ status: "loading", error: null });

    try {
      // Validate required data
      if (
        !data.personalInfo?.firstName ||
        !data.personalInfo?.lastName ||
        !data.personalInfo?.email
      ) {
        throw new Error("Missing required personal information");
      }

      if (!data.internshipDetails?.startDate) {
        throw new Error("Start date is required");
      }

      // Let the backend handle ObjectId conversion and date parsing
      const newIntern = await internService.createIntern(data);

      // Optimistically add to list
      set((state) => ({
        interns: [newIntern, ...state.interns],
        status: "success",
      }));

      // Refresh the list to ensure consistency
      await get().fetchInterns(get().filters);
    } catch (error: any) {
      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to create intern";

      set({
        error: backendMessage,
        status: "error",
      });

      throw new Error(backendMessage);
    }
  },

  updateIntern: async (id: string, data: UpdateInternData) => {
    if (!id) {
      set({ error: "Invalid intern ID", status: "error" });
      return;
    }

    set({ status: "loading", error: null });

    try {
      const updatedIntern = await internService.updateIntern(id, data);

      // Deep merge for nested objects
      set((state) => ({
        interns: state.interns.map((intern) =>
          intern._id === id
            ? {
                ...intern,
                ...updatedIntern,
                personalInfo: {
                  ...intern.personalInfo,
                  ...updatedIntern.personalInfo,
                },
                internshipDetails: {
                  ...intern.internshipDetails,
                  ...updatedIntern.internshipDetails,
                },
              }
            : intern
        ),
        selectedIntern:
          state.selectedIntern?._id === id
            ? {
                ...state.selectedIntern,
                ...updatedIntern,
                personalInfo: {
                  ...state.selectedIntern.personalInfo,
                  ...updatedIntern.personalInfo,
                },
                internshipDetails: {
                  ...state.selectedIntern.internshipDetails,
                  ...updatedIntern.internshipDetails,
                },
              }
            : state.selectedIntern,
        status: "success",
      }));

      // Refresh to ensure consistency
      await get().fetchInterns(get().filters);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update intern";
      console.error("Error updating intern:", error);
      set({
        error: errorMessage,
        status: "error",
      });
      throw error;
    }
  },

  deleteIntern: async (id: string) => {
    if (!id) {
      set({ error: "Invalid intern ID", status: "error" });
      return;
    }

    set({ status: "loading", error: null });

    try {
      await internService.deleteIntern(id);

      // Optimistically remove from list
      set((state) => ({
        interns: state.interns.filter((intern) => intern._id !== id),
        selectedIntern:
          state.selectedIntern?._id === id ? null : state.selectedIntern,
        status: "success",
      }));

      // Refresh to ensure pagination is correct
      const currentFilters = get().filters;
      const currentInternsCount = get().interns.length;
      const currentPage = currentFilters.page ?? 1; // Safe fallback

      // If we deleted the last item on the current page and we're not on the first page, go to previous page
      if (currentInternsCount === 1 && currentPage > 1) {
        await get().fetchInterns({ ...currentFilters, page: currentPage - 1 });
      } else {
        // Otherwise, refetch the current page to update the list and pagination info
        await get().fetchInterns(currentFilters);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete intern";
      console.error("Error deleting intern:", error);
      set({
        error: errorMessage,
        status: "error",
      });
      throw error; // Re-throw to handle in component
    }
  },

  // Comment Methods
  addComment: async (
    internId: string,
    commentData: Omit<AddCommentData, "addedBy">
  ) => {
    if (!internId) {
      set({ error: "Invalid intern ID", status: "error" });
      return;
    }

    set({ status: "loading", error: null });

    try {
      // Get current user info (you'll need to get this from your auth store)
      const currentUser = {
        userId: "current-user-id", // Replace with actual user ID from auth
        userName: "Current User", // Replace with actual user name
        role: "user", // Replace with actual user role
      };

      const completeCommentData: AddCommentData = {
        ...commentData,
        addedBy: currentUser,
      };

      await internService.addComment(internId, completeCommentData);

      // Since the API returns void, we need to refetch the intern to get updated comments
      await get().fetchIntern(internId);

      // Also update the intern in the list
      const updatedIntern = await internService.getIntern(internId);

      set((state) => ({
        interns: state.interns.map((intern) =>
          intern._id === internId ? updatedIntern : intern
        ),
        selectedIntern:
          state.selectedIntern?._id === internId
            ? updatedIntern
            : state.selectedIntern,
        status: "success",
      }));
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add comment";
      console.error("Error adding comment:", error);
      set({
        error: errorMessage,
        status: "error",
      });
      throw error;
    }
  },

  updateComment: async (
    internId: string,
    commentId: string,
    commentData: Partial<AddCommentData>
  ) => {
    if (!internId || !commentId) {
      set({ error: "Invalid intern ID or comment ID", status: "error" });
      return;
    }

    set({ status: "loading", error: null });

    try {
      // Since the API doesn't have update/delete for comments, we'll need to handle this differently
      // For now, let's refetch the intern to get updated data
      await get().fetchIntern(internId);

      set({ status: "success" });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update comment";
      console.error("Error updating comment:", error);
      set({
        error: errorMessage,
        status: "error",
      });
      throw error;
    }
  },

  deleteComment: async (internId: string, commentId: string) => {
    if (!internId || !commentId) {
      set({ error: "Invalid intern ID or comment ID", status: "error" });
      return;
    }

    set({ status: "loading", error: null });

    try {
      // Since the API doesn't have delete for comments, we'll need to handle this differently
      // For now, let's refetch the intern to get updated data
      await get().fetchIntern(internId);

      set({ status: "success" });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete comment";
      console.error("Error deleting comment:", error);
      set({
        error: errorMessage,
        status: "error",
      });
      throw error;
    }
  },

  // Meeting Note Methods
  addMeetingNote: async (
    internId: string,
    meetingData: Omit<AddMeetingNoteData, "addedBy">
  ) => {
    if (!internId) {
      set({ error: "Invalid intern ID", status: "error" });
      return;
    }

    set({ status: "loading", error: null });

    try {
      // Get current user info (you'll need to get this from your auth store)
      const currentUser = {
        userId: "current-user-id", // Replace with actual user ID from auth
        userName: "Current User", // Replace with actual user name
        role: "user", // Replace with actual user role
      };

      const completeMeetingData: AddMeetingNoteData = {
        ...meetingData,
        addedBy: currentUser,
      };

      await internService.addMeetingNote(internId, completeMeetingData);

      // Since the API returns void, we need to refetch the intern to get updated meeting notes
      await get().fetchIntern(internId);

      // Also update the intern in the list
      const updatedIntern = await internService.getIntern(internId);

      set((state) => ({
        interns: state.interns.map((intern) =>
          intern._id === internId ? updatedIntern : intern
        ),
        selectedIntern:
          state.selectedIntern?._id === internId
            ? updatedIntern
            : state.selectedIntern,
        status: "success",
      }));
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add meeting note";
      console.error("Error adding meeting note:", error);
      set({
        error: errorMessage,
        status: "error",
      });
      throw error;
    }
  },

  updateMeetingNote: async (
    internId: string,
    meetingId: string,
    meetingData: Partial<AddMeetingNoteData>
  ) => {
    if (!internId || !meetingId) {
      set({ error: "Invalid intern ID or meeting ID", status: "error" });
      return;
    }

    set({ status: "loading", error: null });

    try {
      // Since the API doesn't have update/delete for meeting notes, we'll need to handle this differently
      // For now, let's refetch the intern to get updated data
      await get().fetchIntern(internId);

      set({ status: "success" });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update meeting note";
      console.error("Error updating meeting note:", error);
      set({
        error: errorMessage,
        status: "error",
      });
      throw error;
    }
  },

  deleteMeetingNote: async (internId: string, meetingId: string) => {
    if (!internId || !meetingId) {
      set({ error: "Invalid intern ID or meeting ID", status: "error" });
      return;
    }

    set({ status: "loading", error: null });

    try {
      // Since the API doesn't have delete for meeting notes, we'll need to handle this differently
      // For now, let's refetch the intern to get updated data
      await get().fetchIntern(internId);

      set({ status: "success" });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to delete meeting note";
      console.error("Error deleting meeting note:", error);
      set({
        error: errorMessage,
        status: "error",
      });
      throw error;
    }
  },

  // Performance Review Methods
  addPerformanceReview: async (
    internId: string,
    reviewData: AddPerformanceReviewData
  ) => {
    if (!internId) {
      set({ error: "Invalid intern ID", status: "error" });
      return;
    }

    set({ status: "loading", error: null });

    try {
      await internService.addPerformanceReview(internId, reviewData);

      // Only fetch once - this will update both selectedIntern and the list
      const updatedIntern = await internService.getIntern(internId);

      set((state) => ({
        interns: state.interns.map((intern) =>
          intern._id === internId ? updatedIntern : intern
        ),
        selectedIntern: updatedIntern,
        status: "success",
      }));
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to add performance review";
      console.error("Error adding performance review:", error);
      set({
        error: errorMessage,
        status: "error",
      });
      throw error;
    }
  },

  updatePerformanceReview: async (
    internId: string,
    reviewId: string,
    reviewData: Partial<AddPerformanceReviewData>
  ) => {
    if (!internId || !reviewId) {
      set({ error: "Invalid intern ID or review ID", status: "error" });
      return;
    }

    set({ status: "loading", error: null });

    try {
      await internService.updatePerformanceReview(
        internId,
        reviewId,
        reviewData
      );

      // Only fetch once
      const updatedIntern = await internService.getIntern(internId);

      set((state) => ({
        interns: state.interns.map((intern) =>
          intern._id === internId ? updatedIntern : intern
        ),
        selectedIntern: updatedIntern,
        status: "success",
      }));
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update performance review";
      console.error("Error updating performance review:", error);
      set({
        error: errorMessage,
        status: "error",
      });
      throw error;
    }
  },

  fetchPerformance: async (internId: string) => {
    if (!internId) {
      set({ error: "Invalid intern ID", status: "error" });
      return;
    }

    set({ status: "loading", error: null });

    try {
      // Just fetch the intern - it will include performance data
      await get().fetchIntern(internId);

      set({ status: "success", error: null });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch performance data";
      console.error("Error fetching performance:", error);
      set({
        error: errorMessage,
        status: "error",
      });
      throw error;
    }
  },

  setFilters: (filters: Partial<InternFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));

    // Auto-fetch when filters change (optional - component can handle this)
    get().fetchInterns(filters);
  },

  clearError: () => set({ error: null }),

  reset: () => set(initialState),
}));