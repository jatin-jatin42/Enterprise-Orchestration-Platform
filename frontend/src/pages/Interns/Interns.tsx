import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { useInternStore } from '../../stores/internStore';
import { useAuthStore } from '../../stores/authStore';
import { type Intern, InternStatus, type Mentor } from '../../types';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import InternForm from './InternForm';
import DeleteConfirmation from './DeleteConfirmation';
import InternDetailModal from './InternDetailModal';
import CommentModal from './forms/CommentModal'


// Updated schema with optional mentor
export const internSchema = z.object({
  personalInfo: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    profileImage: z.string().optional(),
    dateOfBirth: z.string().optional(),
    address: z.string().optional(),
  }),
  internshipDetails: z.object({
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().optional(),
    duration: z.string().optional(),
    department: z.string().min(1, 'Department is required'),
    position: z.string().min(1, 'Position is required'),
    mentor: z.object({
      userId: z.string().optional(),
      name: z.string().optional(),
    }).optional(),
    status: z.enum(['Active', 'Completed', 'On Leave', 'Terminated']),
  }),
}).refine((data) => {
  if (data.internshipDetails.startDate && data.internshipDetails.endDate) {
    const start = new Date(data.internshipDetails.startDate);
    const end = new Date(data.internshipDetails.endDate);
    return end >= start;
  }
  return true;
}, {
  message: "End date must be after start date",
  path: ["internshipDetails.endDate"],
});

export type InternFormData = z.infer<typeof internSchema>;

export default function Interns() {
  const { user } = useAuthStore();
  const {
    interns,
    status,
    error,
    fetchInterns,
    createIntern,
    updateIntern,
    deleteIntern,
    clearError,
  } = useInternStore();

  const [showForm, setShowForm] = useState(false);
  const [editingIntern, setEditingIntern] = useState<Intern | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<InternStatus | 'All'>('All');

  // Fetch all interns on component mount
  useEffect(() => {
    fetchInterns();
  }, [fetchInterns]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  // Frontend search and status filter
  const filteredInterns = useMemo(() => {
    let filtered = interns;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(intern =>
        intern.personalInfo.firstName.toLowerCase().includes(query) ||
        intern.personalInfo.lastName.toLowerCase().includes(query) ||
        intern.personalInfo.email.toLowerCase().includes(query) ||
        // intern.internshipDetails.department.toLowerCase().includes(query) ||
        // intern.internshipDetails.position.toLowerCase().includes(query) ||
        (intern.personalInfo.phone && intern.personalInfo.phone.includes(query)) ||
        (intern.internshipDetails.mentor?.name && intern.internshipDetails.mentor.name.toLowerCase().includes(query))
      );
    }

    // Apply status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter(intern => intern.internshipDetails.status === statusFilter);
    }

    return filtered;
  }, [interns, searchQuery, statusFilter]);

  const safeInterns = useMemo(() => filteredInterns || [], [filteredInterns]);
  const isLoading = status === 'loading';

  // Stats calculations
  const stats = useMemo(() => {
    const total = interns.length;
    const active = interns.filter(i => i.internshipDetails.status === 'Active').length;
    const completed = interns.filter(i => i.internshipDetails.status === 'Completed').length;
    const onLeave = interns.filter(i => i.internshipDetails.status === 'On Leave').length;
    const terminated = interns.filter(i => i.internshipDetails.status === 'Terminated').length;

    return { total, active, completed, onLeave, terminated };
  }, [interns]);

  const handleFormSubmit = async (data: InternFormData) => {
    try {
      // Transform the form data to match the API expected format
      const submitData = {
        personalInfo: {
          firstName: data.personalInfo.firstName,
          lastName: data.personalInfo.lastName,
          email: data.personalInfo.email,
          phone: data.personalInfo.phone || undefined,
          profileImage: data.personalInfo.profileImage || undefined,
          dateOfBirth: data.personalInfo.dateOfBirth || undefined,
          address: data.personalInfo.address || undefined,
        },
        internshipDetails: {
          startDate: data.internshipDetails.startDate,
          endDate: data.internshipDetails.endDate || undefined,
          duration: data.internshipDetails.duration || undefined,
          department: data.internshipDetails.department,
          position: data.internshipDetails.position,
          status: data.internshipDetails.status,
          // Only include mentor if both userId and name are provided
          mentor: data.internshipDetails.mentor?.userId && data.internshipDetails.mentor?.name
            ? {
              userId: data.internshipDetails.mentor.userId,
              name: data.internshipDetails.mentor.name,
            }
            : undefined,
        },
      };

      if (editingIntern) {
        await updateIntern(editingIntern._id, submitData);
        toast.success('Intern updated successfully');
      } else {
        await createIntern(submitData);
        toast.success('Intern created successfully');
      }
      setShowForm(false);
      setEditingIntern(null);
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Failed to save intern. Please try again.');
    }
  };

  const handleEdit = (intern: Intern) => {
    setEditingIntern(intern);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    setDeleteLoading(id);
    try {
      await deleteIntern(id);
      toast.success('Intern deleted successfully');
      setShowDeleteConfirm(null);
    } catch (error) {
      toast.error('Failed to delete intern');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleCreateClick = () => {
    setEditingIntern(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingIntern(null);
  };

  const handleCloseDeleteConfirm = () => {
    setShowDeleteConfirm(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: InternStatus) => {
    switch (status) {
      case 'Active':
        return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case 'Completed':
        return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      case 'On Leave':
        return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      case 'Terminated':
        return 'bg-red-500/20 text-red-400 border border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  };

  const [viewingIntern, setViewingIntern] = useState<Intern | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Add these handler functions
 

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setViewingIntern(null);
  };



  const handleViewDetails = (intern: Intern) => {
  setViewingIntern(intern);
  setShowDetailModal(true);
};
const [showCommentModal, setShowCommentModal] = useState(false);
const [showMeetingModal, setShowMeetingModal] = useState(false);
const [selectedInternId, setSelectedInternId] = useState<string | null>(null);
const [commentLoading, setCommentLoading] = useState(false);
const [meetingLoading, setMeetingLoading] = useState(false);

// Add these handler functions with the existing ones
const handleCommentSubmit = async (data: any) => {
    if (!selectedInternId) return;

    setCommentLoading(true);
    try {
        await useInternStore.getState().addComment(selectedInternId, {
            date: data.date,
            comment: data.comment,
            taskDescription: data.taskDescription,
            hoursWorked: data.hoursWorked,
            status: data.status
        });
        toast.success('Comment added successfully');
        setShowCommentModal(false);
        setSelectedInternId(null);
    } catch (error) {
        console.error('Error adding comment:', error);
    } finally {
        setCommentLoading(false);
    }
};

const handleMeetingSubmit = async (data: any) => {
    if (!selectedInternId) return;

    setMeetingLoading(true);
    try {
        await useInternStore.getState().addMeetingNote(selectedInternId, {
            date: data.date,
            title: data.title,
            agenda: data.agenda,
            notes: data.notes,
            attendees: data.attendees,
            actionItems: data.actionItems,
            nextMeetingDate: data.nextMeetingDate
        });
        toast.success('Meeting note added successfully');
        setShowMeetingModal(false);
        setSelectedInternId(null);
    } catch (error) {
        toast.error('Failed to add meeting note');
        console.error('Error adding meeting:', error);
    } finally {
        setMeetingLoading(false);
    }
};


const handleCloseCommentModal = () => {
    setShowCommentModal(false);
    setSelectedInternId(null);
};

const handleCloseMeetingModal = () => {
    setShowMeetingModal(false);
    setSelectedInternId(null);
};
const handleAddComment = (internId: string) => {
  setSelectedInternId(internId);
  setShowCommentModal(true);
};

const handleAddMeeting = (internId: string) => {
  setSelectedInternId(internId);
  setShowMeetingModal(true);
};

  return (
    <div className="space-y-6 bg-gray-900 p-6 overflow-hidden no-scrollbar">
      {/* Header with Title and Create Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white">Interns Management</h1>
          <p className="text-gray-400 text-sm">Manage and track your organization's interns</p>
        </div>

      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs font-medium">Total Interns</p>
              <p className="text-xl font-bold text-white mt-1">{stats.total}</p>
            </div>
            <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs font-medium">Active</p>
              <p className="text-xl font-bold text-white mt-1">{stats.active}</p>
            </div>
            <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs font-medium">Completed</p>
              <p className="text-xl font-bold text-white mt-1">{stats.completed}</p>
            </div>
            <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs font-medium">On Leave</p>
              <p className="text-xl font-bold text-white mt-1">{stats.onLeave}</p>
            </div>
            <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs font-medium">Terminated</p>
              <p className="text-xl font-bold text-white mt-1">{stats.terminated}</p>
            </div>
            <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Row */}

      <div className="section-actions  shadow-sm mb-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 xl:gap-8 justify-between items-start lg:items-center">
          {/* Search and Filter */}
          <div className="search-filter flex flex-col sm:flex-row gap-3 flex-1">
            {/* Search Input */}
            <div className="relative flex-1 ">
              <svg className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search interns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-white placeholder-gray-400"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as InternStatus | 'All')}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-white min-w-[140px]"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="On Leave">On Leave</option>
              <option value="Terminated">Terminated</option>
            </select>
          </div>

          {/* Add Intern Button - Admin Only */}
          {user?.role === 'admin' && (
            <button
              onClick={handleCreateClick}
              className="bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors flex items-center gap-2 min-w-[140px] justify-center"
              disabled={isLoading}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Intern
            </button>
          )}
        </div>
      </div>






      {/* Interns Cards Grid */}
      <div className="rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center p-12">
            <LoadingSpinner size="lg" />
            <span className="ml-3 text-gray-400 text-lg">Loading interns...</span>
          </div>
        ) : (
          <>
            <div className="p-1">
              {/* Cards Grid */}
              {safeInterns.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                  {safeInterns.map((intern) => (
                    <div
                      key={intern._id}
                      className="intern-card bg-gray-800 border border-gray-700 rounded-lg transition-all duration-300 hover:shadow-xl hover:shadow-teal-900/20 hover:border-teal-500/50 hover:scale-[1.02] hover:bg-gray-750"
                      data-id={intern._id}
                    >
                      {/* Header Section */}
                      <div className="intern-header bg-linear-to-r from-teal-800 to-gray-700 p-4 md:p-6 text-white rounded-t-lg">
                        <div className="intern-name text-lg md:text-xl lg:text-2xl font-bold tracking-tight">
                          {intern.personalInfo?.firstName} {intern.personalInfo?.lastName}
                        </div>
                        <div className="intern-position text-blue-100 text-xs md:text-sm lg:text-base mt-1 opacity-90">
                          {intern.internshipDetails?.position}
                        </div>
                        <div className="intern-info flex justify-between items-center mt-3 md:mt-4">
                          <span className="intern-department font-medium bg-teal-700/40 backdrop-blur-sm px-2 md:px-3 py-1 rounded-lg text-xs md:text-sm border border-teal-500/30">
                            {intern.internshipDetails?.department}
                          </span>
                          <span className={`status px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium ${getStatusColor(intern.internshipDetails?.status)}`}>
                            {intern.internshipDetails?.status}
                          </span>
                        </div>
                      </div>

                      {/* Body Section */}
                      <div className="intern-body p-4 md:p-6">
                        <div className="intern-details grid grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
                          <div className="intern-detail">
                            <strong className="block text-xs md:text-sm text-gray-400 mb-1">Email</strong>
                            <span className="text-white text-sm md:text-base  truncate block" title={intern.personalInfo?.email}>
                              {intern.personalInfo?.email}
                            </span>
                          </div>
                          <div className="intern-detail">
                            <strong className="block text-xs md:text-sm text-gray-400 mb-1">Start Date</strong>
                            <span className="text-white text-sm md:text-base ">
                              {formatDate(intern.internshipDetails?.startDate)}
                            </span>
                          </div>
                          <div className="intern-detail">
                            <strong className="block text-xs md:text-sm text-gray-400 mb-1">Projects</strong>
                            <span className="text-white text-sm md:text-base ">
                              {intern.projects?.length || 0} active
                            </span>
                          </div>
                          <div className="intern-detail">
                            <strong className="block text-xs md:text-sm text-gray-400 mb-1">Duration</strong>
                            <span className="text-white text-sm md:text-base ">
                              {intern.internshipDetails?.duration || '6 months'}
                            </span>
                          </div>
                        </div>

                        <div className="intern-actions pt-4 border-t border-gray-700">
                          {user?.role === 'admin' ? (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              <button
                                className="bg-gray-700 text-gray-300 px-2 py-1.5 rounded text-xs xl:text-sm font-medium hover:bg-gray-600 transition-colors truncate"
                                onClick={() => handleViewDetails(intern)}
                              >
                                View Details
                              </button>
                              <button
                                className="bg-gray-700 text-gray-300 px-2 py-1.5 rounded text-xs xl:text-sm font-medium hover:bg-gray-600 transition-colors truncate"
                              onClick={() => handleAddComment(intern._id)}
                              >
                                Add Comment
                              </button>
                              <button
                                className="bg-gray-700 text-gray-300 px-2 py-1.5 rounded text-xs xl:text-sm font-medium hover:bg-gray-600 transition-colors truncate"
                                onClick={() => handleEdit(intern)}
                                disabled={isLoading}
                              >
                                Edit
                              </button>
                              <button
                                className="bg-gray-700 text-gray-300 px-2 py-1.5 rounded text-xs xl:text-sm font-medium hover:bg-gray-600 transition-colors truncate"
                                onClick={() => setShowDeleteConfirm(intern._id)}
                                disabled={isLoading || deleteLoading === intern._id}
                              >
                                {deleteLoading === intern._id ? 'Deleting...' : 'Delete'}
                              </button>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                className="bg-gray-700 text-gray-300 px-2 py-1.5 rounded text-xs xl:text-sm font-medium hover:bg-gray-600 transition-colors truncate"
                              onClick={() => handleViewDetails(intern)}
                              >
                                View Details
                              </button>
                              <button
                                className="bg-gray-700 text-gray-300 px-2 py-1.5 rounded text-xs xl:text-sm font-medium hover:bg-gray-600 transition-colors truncate"
                              onClick={() => handleAddComment(intern._id)}
                              >
                                Add Comment
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Empty State */
                <div className="text-center py-16">
                  <div className="text-gray-600 mb-6">
                    <svg className="mx-auto h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {searchQuery || statusFilter !== 'All' ? 'No matching interns found' : 'No interns found'}
                  </h3>
                  <p className="text-gray-400 text-lg mb-6 max-w-md mx-auto">
                    {searchQuery || statusFilter !== 'All'
                      ? `No interns match your current filters. Try adjusting your search criteria.`
                      : 'Get started by adding your first intern to the system.'}
                  </p>
                  {user?.role === 'admin' && !searchQuery && statusFilter === 'All' && (
                    <button
                      onClick={handleCreateClick}
                      className="bg-indigo-600 text-white px-6 py-3 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors inline-flex items-center gap-2 text-lg font-medium"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Your First Intern
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <InternForm
          editingIntern={editingIntern}
          onSubmit={handleFormSubmit}
          onClose={handleCloseForm}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <DeleteConfirmation
          internId={showDeleteConfirm}
          onConfirm={handleDelete}
          onClose={handleCloseDeleteConfirm}
          isLoading={deleteLoading === showDeleteConfirm}
        />
      )}


      {showDetailModal && (
        <InternDetailModal
          intern={viewingIntern}
          isOpen={showDetailModal}
          onClose={handleCloseDetailModal}
          onAddComment={handleAddComment}
          onAddMeeting={handleAddMeeting}
        />
      )}

      <CommentModal
    isOpen={showCommentModal}
    onClose={handleCloseCommentModal}
    onSubmit={handleCommentSubmit}
    isLoading={commentLoading}
/>
    </div>
  );
}