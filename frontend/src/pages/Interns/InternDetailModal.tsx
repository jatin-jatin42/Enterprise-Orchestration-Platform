import { useEffect, useState } from 'react';
import { type Intern, InternStatus, type CommentStatus, type MeetingStatus, type AddPerformanceReviewData } from '../../types';
import { useAuthStore } from '../../stores/authStore';
import { useInternStore } from '../../stores/internStore'
import { toast } from 'react-hot-toast';
import CommentModal from './forms/CommentModal';
import MeetingModal from './forms/MeetingModal';
import PerformanceModal from './forms/PerformanceModal';

interface InternDetailModalProps {
    intern: Intern | null;
    isOpen: boolean;
    onClose: () => void;
    onAddComment: (internId: string) => void;
    onAddMeeting: (internId: string) => void;
}

type TabType = 'info' | 'projects' | 'comments' | 'meetings' | 'skills';

export default function InternDetailModal({
    intern,
    isOpen,
    onClose,
}: InternDetailModalProps) {
    const { user } = useAuthStore();
    const { fetchIntern, addPerformanceReview, updatePerformanceReview } = useInternStore();
    const [activeTab, setActiveTab] = useState<TabType>('info');
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [showMeetingModal, setShowMeetingModal] = useState(false);
    const [showPerformanceModal, setShowPerformanceModal] = useState(false);
    const [selectedInternId, setSelectedInternId] = useState<string | null>(null);
    const [commentLoading, setCommentLoading] = useState(false);
    const [meetingLoading, setMeetingLoading] = useState(false);
    const [performanceLoading, setPerformanceLoading] = useState(false);
    const [currentIntern, setCurrentIntern] = useState<Intern | null>(intern);
    const [editingReview, setEditingReview] = useState<any>(null);

    // Update current intern when prop changes
    useEffect(() => {
        setCurrentIntern(intern);
    }, [intern]);

    // Update the handler functions
    const handleAddComment = (internId: string) => {
        setSelectedInternId(internId);
        setShowCommentModal(true);
    };

    const handleAddMeeting = (internId: string) => {
        setSelectedInternId(internId);
        setShowMeetingModal(true);
    };

    const handleAddPerformance = (internId: string) => {
        setSelectedInternId(internId);
        setEditingReview(null);
        setShowPerformanceModal(true);
    };

    const handleEditPerformance = (review: any) => {
        setSelectedInternId(currentIntern?._id || null);
        setEditingReview(review);
        setShowPerformanceModal(true);
    };

    const handlePerformanceSubmit = async (data: AddPerformanceReviewData) => {
        if (!selectedInternId) {
            toast.error('No intern selected');
            return;
        }

        setPerformanceLoading(true);
        try {
            if (editingReview && editingReview._id) {
                // Update existing review
                await updatePerformanceReview(selectedInternId, editingReview._id, data);
                toast.success('Performance review updated successfully');
            } else {
                // Add new review
                await addPerformanceReview(selectedInternId, data);
                toast.success('Performance review added successfully');
            }

            // Refresh the intern data
            await fetchIntern(selectedInternId);
            
            // Update current intern with fresh data
            const latestInterns = useInternStore.getState().interns;
            const updatedIntern = latestInterns.find(i => i._id === selectedInternId);
            if (updatedIntern) {
                setCurrentIntern(updatedIntern);
            }

            setShowPerformanceModal(false);
            setSelectedInternId(null);
            setEditingReview(null);
        } catch (error: any) {
            console.error('Error saving performance review:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save performance review';
            toast.error(errorMessage);
        } finally {
            setPerformanceLoading(false);
        }
    };

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

            // Refresh the intern data to show the new comment
            if (selectedInternId) {
                await fetchIntern(selectedInternId);
                // Get the latest interns array from store
                const latestInterns = useInternStore.getState().interns;
                const updatedIntern = latestInterns.find(i => i._id === selectedInternId);
                if (updatedIntern) {
                    setCurrentIntern(updatedIntern);
                }
            }

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

            // Refresh the intern data to show the new meeting note
            if (selectedInternId) {
                await fetchIntern(selectedInternId);
                // Get the latest interns array from store
                const latestInterns = useInternStore.getState().interns;
                const updatedIntern = latestInterns.find(i => i._id === selectedInternId);
                if (updatedIntern) {
                    setCurrentIntern(updatedIntern);
                }
            }

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

    const handleClosePerformanceModal = () => {
        setShowPerformanceModal(false);
        setSelectedInternId(null);
        setEditingReview(null);
    };

    useEffect(() => {
        if (isOpen) {
            setActiveTab('info');
            // Refresh intern data when modal opens
            if (intern?._id) {
                fetchIntern(intern._id);
            }
        }
    }, [isOpen, intern?._id, fetchIntern]);

    if (!isOpen || !currentIntern) return null;

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getStatusClass = (status: InternStatus | CommentStatus | MeetingStatus) => {
        switch (status) {
            case 'Active':
            case 'Completed':
                return 'bg-green-500/20 text-green-400 border border-green-500/30';
            case 'In Progress':
                return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
            case 'On Leave':
            case 'On Hold':
                return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
            case 'Terminated':
            case 'Blocked':
                return 'bg-red-500/20 text-red-400 border border-red-500/30';
            default:
                return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
        }
    };

    const fullName = `${currentIntern.personalInfo.firstName} ${currentIntern.personalInfo.lastName}`;

    const renderInfoTab = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="detail-item">
                    <div className="detail-label text-sm text-gray-400 mb-1">Email</div>
                    <div className="detail-value text-white">{currentIntern.personalInfo.email}</div>
                </div>
                <div className="detail-item">
                    <div className="detail-label text-sm text-gray-400 mb-1">Phone</div>
                    <div className="detail-value text-white">{currentIntern.personalInfo.phone || 'N/A'}</div>
                </div>
                <div className="detail-item">
                    <div className="detail-label text-sm text-gray-400 mb-1">Department</div>
                    <div className="detail-value text-white">{currentIntern.internshipDetails.department || 'N/A'}</div>
                </div>
                <div className="detail-item">
                    <div className="detail-label text-sm text-gray-400 mb-1">Position</div>
                    <div className="detail-value text-white">{currentIntern.internshipDetails.position || 'N/A'}</div>
                </div>
                <div className="detail-item">
                    <div className="detail-label text-sm text-gray-400 mb-1">Start Date</div>
                    <div className="detail-value text-white">{formatDate(currentIntern.internshipDetails.startDate)}</div>
                </div>
                <div className="detail-item">
                    <div className="detail-label text-sm text-gray-400 mb-1">End Date</div>
                    <div className="detail-value text-white">
                        {currentIntern.internshipDetails.endDate ? formatDate(currentIntern.internshipDetails.endDate) : 'N/A'}
                    </div>
                </div>
                <div className="detail-item">
                    <div className="detail-label text-sm text-gray-400 mb-1">Duration</div>
                    <div className="detail-value text-white">{currentIntern.internshipDetails.duration || 'N/A'}</div>
                </div>
                <div className="detail-item">
                    <div className="detail-label text-sm text-gray-400 mb-1">Mentor</div>
                    <div className="detail-value text-white">
                        {currentIntern.internshipDetails.mentor?.name || 'No mentor assigned'}
                    </div>
                </div>
                {currentIntern.personalInfo.dateOfBirth && (
                    <div className="detail-item">
                        <div className="detail-label text-sm text-gray-400 mb-1">Date of Birth</div>
                        <div className="detail-value text-white">{formatDate(currentIntern.personalInfo.dateOfBirth)}</div>
                    </div>
                )}
                {currentIntern.personalInfo.address && (
                    <div className="detail-item md:col-span-2">
                        <div className="detail-label text-sm text-gray-400 mb-1">Address</div>
                        <div className="detail-value text-white">{currentIntern.personalInfo.address}</div>
                    </div>
                )}
            </div>
        </div>
    );

    const renderProjectsTab = () => (
        <div className="space-y-4">
            {!currentIntern.projects || currentIntern.projects.length === 0 ? (
                <p className="text-gray-400 text-center py-4">No projects assigned yet.</p>
            ) : (
                currentIntern.projects.map((project, index) => (
                    <div key={project.projectId || index} className="project-item bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                        <div className="project-header flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                            <div className="project-name font-semibold text-white text-lg">
                                {project.projectName || 'Unnamed Project'}
                            </div>
                            {project.status && (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(project.status)} self-start`}>
                                    {project.status}
                                </span>
                            )}
                        </div>

                        <div className="project-meta flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-sm text-gray-300 mb-3">
                            {project.role && <span><strong>Role:</strong> {project.role}</span>}
                            {project.startDate && <span><strong>Start:</strong> {formatDate(project.startDate)}</span>}
                            {project.endDate && <span><strong>End:</strong> {formatDate(project.endDate)}</span>}
                        </div>

                        {project.description && (
                            <p className="text-gray-300 text-sm mb-3">{project.description}</p>
                        )}

                        {project.technologies && project.technologies.length > 0 && (
                            <div className="tech-tags flex flex-wrap gap-2 mb-3">
                                {project.technologies.map((tech, techIndex) => (
                                    <span key={techIndex} className="tech-tag bg-gray-600 text-gray-300 px-2 py-1 rounded text-xs">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        )}

                        {project.teamMembers && project.teamMembers.length > 0 && (
                            <div className="mt-3 text-sm text-gray-300">
                                <strong>Team Members:</strong>
                                <div className="mt-1 space-y-1">
                                    {project.teamMembers.map((member, memberIndex) => (
                                        <div key={memberIndex} className="flex items-center gap-2">
                                            <span>{member.name}</span>
                                            <span className="text-gray-400 text-xs">({member.role})</span>
                                            <span className="text-gray-500 text-xs">- {member.memberType}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {(project.projectUrl || project.pdfUrl) && (
                            <div className="flex flex-wrap gap-2 mt-4">
                                {project.projectUrl && (
                                    <a
                                        href={project.projectUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn--outline btn--sm bg-transparent border border-indigo-500 text-indigo-400 px-3 py-1 rounded text-sm hover:bg-indigo-500 hover:text-white transition-colors"
                                    >
                                        View Project
                                    </a>
                                )}
                                {project.pdfUrl && (
                                    <a
                                        href={project.pdfUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn--secondary btn--sm bg-gray-600 text-gray-300 px-3 py-1 rounded text-sm hover:bg-gray-500 transition-colors"
                                    >
                                        View PDF
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );

    const renderCommentsTab = () => (
        <div className="space-y-4">
            <div className="mb-4">
                <button
                    onClick={() => handleAddComment(currentIntern._id)}
                    className="bg-indigo-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Comment
                </button>
            </div>
            <div className="comments-list space-y-4">
                {!currentIntern.dailyComments || currentIntern.dailyComments.length === 0 ? (
                    <p className="text-gray-400 text-center py-4">No daily comments yet.</p>
                ) : (
                    currentIntern.dailyComments
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((comment) => (
                            <div key={comment._id} className="comment-item bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                                <div className="comment-header flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
                                    <strong className="text-white">{formatDate(comment.date)}</strong>
                                    <span className="comment-date text-sm text-gray-400 flex flex-wrap items-center gap-1 sm:gap-2">
                                        by {comment.addedBy.userName}
                                        {comment.hoursWorked && <span>• {comment.hoursWorked}h</span>}
                                        {comment.status && (
                                            <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusClass(comment.status)}`}>
                                                {comment.status}
                                            </span>
                                        )}
                                    </span>
                                </div>

                                {comment.taskDescription && (
                                    <div className="comment-meta mb-2">
                                        <span className="text-sm text-gray-300">
                                            <strong>Task:</strong> {comment.taskDescription}
                                        </span>
                                    </div>
                                )}

                                <p className="text-gray-300 text-sm">{comment.comment}</p>

                                {comment.createdAt && (
                                    <div className="mt-2 text-xs text-gray-500">
                                        Created: {formatDate(comment.createdAt)}
                                    </div>
                                )}
                            </div>
                        ))
                )}
            </div>
        </div>
    );

    const renderMeetingsTab = () => (
        <div className="space-y-4">
            <div className="mb-4">
                <button
                    onClick={() => handleAddMeeting(currentIntern._id)}
                    className="bg-indigo-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Meeting
                </button>
            </div>
            <div className="meetings-list space-y-4">
                {!currentIntern.meetingNotes || currentIntern.meetingNotes.length === 0 ? (
                    <p className="text-gray-400 text-center py-4">No meeting notes yet.</p>
                ) : (
                    currentIntern.meetingNotes
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((meeting) => (
                            <div key={meeting._id} className="meeting-item bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                                <div className="meeting-header mb-3">
                                    <div className="meeting-title font-semibold text-white text-lg mb-1">
                                        {meeting.title || 'Untitled Meeting'}
                                    </div>
                                    <span className="meeting-date text-sm text-gray-400 flex flex-col sm:flex-row sm:items-center gap-1">
                                        {formatDate(meeting.date)} 
                                        <span className="hidden sm:block">•</span>
                                        by {meeting.addedBy.userName}
                                    </span>
                                </div>

                                {meeting.agenda && (
                                    <p className="text-gray-300 text-sm mb-2">
                                        <strong>Agenda:</strong> {meeting.agenda}
                                    </p>
                                )}

                                <p className="text-gray-300 text-sm mb-2">
                                    <strong>Notes:</strong> {meeting.notes}
                                </p>

                                {meeting.attendees && meeting.attendees.length > 0 && (
                                    <p className="text-gray-300 text-sm mb-2">
                                        <strong>Attendees:</strong> {meeting.attendees.join(', ')}
                                    </p>
                                )}

                                {meeting.actionItems && meeting.actionItems.length > 0 && (
                                    <p className="text-gray-300 text-sm mb-2">
                                        <strong>Action Items:</strong> {meeting.actionItems.join(', ')}
                                    </p>
                                )}

                                {meeting.nextMeetingDate && (
                                    <p className="text-gray-300 text-sm mb-2">
                                        <strong>Next Meeting:</strong> {formatDate(meeting.nextMeetingDate)}
                                    </p>
                                )}

                                {meeting.createdAt && (
                                    <div className="mt-2 text-xs text-gray-500">
                                        Created: {formatDate(meeting.createdAt)}
                                    </div>
                                )}
                            </div>
                        ))
                )}
            </div>
        </div>
    );

    const renderSkillsTab = () => (
        <div className="space-y-6">
            {/* Skills Section */}
            <div className="skills-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="skills-category">
                    <h5 className="text-white font-semibold mb-3">Technical Skills</h5>
                    <div className="skills-list flex flex-wrap gap-2">
                        {currentIntern.skills?.technical?.map((skill, index) => (
                            <span key={index} className="skill-tag bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm border border-blue-500/30">
                                {skill}
                            </span>
                        ))}
                        {(!currentIntern.skills?.technical || currentIntern.skills.technical.length === 0) && (
                            <span className="text-gray-400 text-sm">No technical skills listed</span>
                        )}
                    </div>
                </div>

                <div className="skills-category">
                    <h5 className="text-white font-semibold mb-3">Soft Skills</h5>
                    <div className="skills-list flex flex-wrap gap-2">
                        {currentIntern.skills?.soft?.map((skill, index) => (
                            <span key={index} className="skill-tag bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm border border-green-500/30">
                                {skill}
                            </span>
                        ))}
                        {(!currentIntern.skills?.soft || currentIntern.skills.soft.length === 0) && (
                            <span className="text-gray-400 text-sm">No soft skills listed</span>
                        )}
                    </div>
                </div>

                <div className="skills-category">
                    <h5 className="text-white font-semibold mb-3">Currently Learning</h5>
                    <div className="skills-list flex flex-wrap gap-2">
                        {currentIntern.skills?.learning?.map((skill, index) => (
                            <span key={index} className="skill-tag bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm border border-purple-500/30">
                                {skill}
                            </span>
                        ))}
                        {(!currentIntern.skills?.learning || currentIntern.skills.learning.length === 0) && (
                            <span className="text-gray-400 text-sm">No skills in progress</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Performance Section */}
            <div className="mt-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
                    <h5 className="text-white font-semibold text-lg">Performance Reviews</h5>
                    {user?.role === 'admin' && (
                        <button
                            onClick={() => handleAddPerformance(currentIntern._id)}
                            className="bg-indigo-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Performance Review
                        </button>
                    )}
                </div>

                {/* Performance Ratings Summary */}
                {currentIntern.performance && (
                    <div className="mb-6 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                        <h6 className="text-white font-semibold mb-3">Performance Summary</h6>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-3">
                            {currentIntern.performance.overallRating !== undefined && (
                                <div className="detail-item">
                                    <div className="detail-label text-sm text-gray-400 mb-1">Overall</div>
                                    <div className="detail-value text-white text-lg font-semibold">
                                        {currentIntern.performance.overallRating}/5
                                    </div>
                                </div>
                            )}
                            {currentIntern.performance.codeQuality !== undefined && (
                                <div className="detail-item">
                                    <div className="detail-label text-sm text-gray-400 mb-1">Code Quality</div>
                                    <div className="detail-value text-white text-lg font-semibold">
                                        {currentIntern.performance.codeQuality}/5
                                    </div>
                                </div>
                            )}
                            {currentIntern.performance.communication !== undefined && (
                                <div className="detail-item">
                                    <div className="detail-label text-sm text-gray-400 mb-1">Communication</div>
                                    <div className="detail-value text-white text-lg font-semibold">
                                        {currentIntern.performance.communication}/5
                                    </div>
                                </div>
                            )}
                            {currentIntern.performance.teamwork !== undefined && (
                                <div className="detail-item">
                                    <div className="detail-label text-sm text-gray-400 mb-1">Teamwork</div>
                                    <div className="detail-value text-white text-lg font-semibold">
                                        {currentIntern.performance.teamwork}/5
                                    </div>
                                </div>
                            )}
                            {currentIntern.performance.punctuality !== undefined && (
                                <div className="detail-item">
                                    <div className="detail-label text-sm text-gray-400 mb-1">Punctuality</div>
                                    <div className="detail-value text-white text-lg font-semibold">
                                        {currentIntern.performance.punctuality}/5
                                    </div>
                                </div>
                            )}
                        </div>

                        {currentIntern.performance.lastReviewDate && (
                            <p className="text-gray-300 text-sm">
                                <strong>Last Review:</strong> {formatDate(currentIntern.performance.lastReviewDate)}
                            </p>
                        )}
                    </div>
                )}

                {/* Performance Reviews List */}
                {currentIntern.performance?.reviews && currentIntern.performance.reviews.length > 0 ? (
                    <div className="space-y-4">
                        {currentIntern.performance.reviews
                            .sort((a: any, b: any) => new Date(b.reviewDate).getTime() - new Date(a.reviewDate).getTime())
                            .map((review: any, index: number) => (
                                <div key={review._id || index} className="review-item bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                                    <div className="review-header flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="review-rating bg-indigo-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">
                                                {review.rating}/5
                                            </div>
                                            <div>
                                                <div className="text-white font-semibold">
                                                    Review on {formatDate(review.reviewDate)}
                                                </div>
                                                {review.reviewedBy && (
                                                    <div className="text-gray-400 text-sm">
                                                        by {review.reviewedBy.name}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {user?.role === 'admin' && (
                                            <button
                                                onClick={() => handleEditPerformance(review)}
                                                className="bg-gray-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-gray-500 transition-colors flex items-center gap-1 self-start"
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                Edit
                                            </button>
                                        )}
                                    </div>

                                    {review.feedback && (
                                        <p className="text-gray-300 text-sm mb-2">
                                            <strong>Feedback:</strong> {review.feedback}
                                        </p>
                                    )}

                                    {review.createdAt && (
                                        <div className="mt-2 text-xs text-gray-500">
                                            Created: {formatDate(review.createdAt)}
                                        </div>
                                    )}
                                </div>
                            ))}
                    </div>
                ) : (
                    <div className="text-center py-8 bg-gray-700/30 rounded-lg border border-gray-600">
                        <svg className="w-12 h-12 text-gray-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-400">No performance reviews yet.</p>
                        {user?.role === 'admin' && (
                            <p className="text-gray-500 text-sm mt-1">Add the first performance review to get started.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'info':
                return renderInfoTab();
            case 'projects':
                return renderProjectsTab();
            case 'comments':
                return renderCommentsTab();
            case 'meetings':
                return renderMeetingsTab();
            case 'skills':
                return renderSkillsTab();
            default:
                return renderInfoTab();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-gray-800 rounded-xl w-full max-w-4xl h-[85vh] md:h-[80vh] lg:h-[80vh] flex flex-col border border-gray-700 shadow-2xl">
                {/* Header */}
                <div className="bg-linear-to-r from-teal-800 to-gray-700 p-4 sm:p-6 text-white shrink-0 rounded-t-xl">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                        <div className="flex items-center gap-4">
                            <div className="intern-avatar w-12 h-12 sm:w-16 sm:h-16 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl">
                                {currentIntern.personalInfo.firstName.charAt(0)}{currentIntern.personalInfo.lastName.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-xl sm:text-2xl font-bold truncate">{fullName}</h2>
                                <p className="text-blue-100 opacity-90 text-sm sm:text-base truncate">{currentIntern.internshipDetails.position}</p>
                                <span className={`mt-1 sm:mt-2 inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(currentIntern.internshipDetails.status)}`}>
                                    {currentIntern.internshipDetails.status}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-300 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10 self-end sm:self-start"
                        >
                            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-700 shrink-0">
                    <div className="flex overflow-x-auto">
                        {(['info', 'projects', 'comments', 'meetings', 'skills'] as TabType[]).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`tab-btn px-4 sm:px-6 py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap shrink-0 ${activeTab === tab
                                    ? 'border-indigo-500 text-indigo-400'
                                    : 'border-transparent text-gray-400 hover:text-gray-300'
                                    }`}
                            >
                                {tab === 'info' && 'Personal Info'}
                                {tab === 'projects' && 'Projects'}
                                {tab === 'comments' && 'Daily Comments'}
                                {tab === 'meetings' && 'Meetings'}
                                {tab === 'skills' && 'Skills & Performance'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden">
                    <div className="p-4 sm:p-6 h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {renderTabContent()}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <CommentModal
                isOpen={showCommentModal}
                onClose={handleCloseCommentModal}
                onSubmit={handleCommentSubmit}
                isLoading={commentLoading}
            />

            <MeetingModal
                isOpen={showMeetingModal}
                onClose={handleCloseMeetingModal}
                onSubmit={handleMeetingSubmit}
                isLoading={meetingLoading}
            />

            <PerformanceModal
                isOpen={showPerformanceModal}
                onClose={handleClosePerformanceModal}
                onSubmit={handlePerformanceSubmit}
                isLoading={performanceLoading}
                initialData={editingReview}
                isEdit={!!editingReview}
            />
        </div>
    );
}