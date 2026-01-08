import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import type { Project } from '../../types/projects';
import type { User } from '../../types/auth';
import { useProjectStore } from '../../stores/ProjectStore';
import { useInternStore } from '../../stores/internStore';
import { useAuthStore } from '../../stores/authStore';
import { userService } from '../../services/userService';

interface ProjectDetailModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectDetailModal({
  project: initialProject,
  isOpen,
  onClose,
}: ProjectDetailModalProps) {
  const { 
    addProjectDocument, 
    removeProjectDocument, 
    assignInternToProject, 
    removeInternFromProject,
    updateProjectManager,
    projects,
  } = useProjectStore();
  
  const { interns, fetchInterns } = useInternStore();
  const { user } = useAuthStore();

  // Check if user is admin (only admins can see Team Members and Documents)
  const isAdmin = user?.role === 'admin';

  // Get live project data from store to ensure real-time updates
  const project = projects.find(p => p._id === initialProject?._id) || initialProject;

  const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'documents'>('overview');
  
  // Document Upload State
  const [newDocFile, setNewDocFile] = useState<File | null>(null);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Intern Assignment State
  const [selectedInternId, setSelectedInternId] = useState('');
  const [assignRole, setAssignRole] = useState('');
  const [assignStartDate, setAssignStartDate] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Manager Assignment State
  const [isEditingManager, setIsEditingManager] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedManagerId, setSelectedManagerId] = useState('');
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchInterns();
      // Reset states
      setActiveTab('overview');
      setIsEditingManager(false);
    }
  }, [isOpen, fetchInterns]);

  if (!isOpen || !project) {
    return null;
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress': return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case 'Completed': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      case 'On Hold': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  };

  // --- Document Handlers ---
  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocFile || !newDocTitle) return;

    setIsUploading(true);
    try {
      await addProjectDocument(project._id, newDocFile, newDocTitle);
      toast.success('Document added successfully');
      setNewDocFile(null);
      setNewDocTitle('');
    } catch (error) {
      toast.error('Failed to add document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (index: number) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await removeProjectDocument(project._id, index);
      toast.success('Document deleted');
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  // --- Team Handlers ---
  const handleAssignIntern = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInternId || !assignRole) return;

    setIsAssigning(true);
    try {
      await assignInternToProject(project._id, {
        internId: selectedInternId,
        role: assignRole,
        startDate: assignStartDate || undefined,
      });
      toast.success('Intern assigned successfully');
      setSelectedInternId('');
      setAssignRole('');
      setAssignStartDate('');
    } catch (error) {
      toast.error('Failed to assign intern');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberType: string) => {
    if (memberType !== 'Intern') return;

    try {
      await removeInternFromProject(project._id, memberId);
      toast.success('Intern removed successfully');
    } catch (error) {
      toast.error('Failed to remove intern');
    }
  };

  // --- Manager Handlers ---
  const handleEditManagerClick = async () => {
    setIsEditingManager(true);
    if (availableUsers.length === 0) {
      setIsLoadingUsers(true);
      try {
        const users = await userService.getAllUsers();
        setAvailableUsers(users);
        // Pre-select current manager if possible
        const currentManagerId = typeof project.manager?.userId === 'string' 
          ? project.manager?.userId 
          : project.manager?.userId?._id;
        if (currentManagerId) setSelectedManagerId(currentManagerId);
      } catch (error) {
        toast.error('Failed to load users');
        setIsEditingManager(false);
      } finally {
        setIsLoadingUsers(false);
      }
    }
  };

  const handleSaveManager = async () => {
    if (!selectedManagerId) return;
    try {
      const selectedUser = availableUsers.find(u => u._id === selectedManagerId);
      await updateProjectManager(project._id, {
        userId: selectedManagerId,
        name: selectedUser ? `${selectedUser.profile?.firstName || ''} ${selectedUser.profile?.lastName || ''}`.trim() || selectedUser.username : undefined
      });
      toast.success('Project manager updated');
      setIsEditingManager(false);
    } catch (error) {
      toast.error('Failed to update manager');
    }
  };

  // Filter interns not already in the project
  const availableInterns = interns.filter(intern => 
    !project.teamMembers?.some(member => 
      (typeof member.memberId === 'string' ? member.memberId : member.memberId._id) === intern._id
    )
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-gray-800 text-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gray-800 px-6 py-4 border-b border-gray-700 flex justify-between items-center rounded-t-lg">
          <div>
            <h2 className="text-2xl font-bold">{project.projectName}</h2>
            <div className="flex items-center gap-3 mt-1">
               <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(project.status)}`}>
                 {project.status}
               </span>
               <span className="text-sm text-gray-400">{project.description}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700 px-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'overview' ? 'border-indigo-500 text-white' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Overview
          </button>
          {isAdmin && (
            <>
              <button
                onClick={() => setActiveTab('team')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'team' ? 'border-indigo-500 text-white' : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                Team Members
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'documents' ? 'border-indigo-500 text-white' : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                Documents
              </button>
            </>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-700/30 p-4 rounded-lg">
                <div className="relative">
                  <dt className="text-sm font-medium text-gray-400 mb-1">Manager</dt>
                  
                  {!isEditingManager ? (
                    <div className="flex items-center gap-2">
                      <dd className="text-sm text-white">{project.manager?.name || 'N/A'}</dd>
                      <button 
                        onClick={handleEditManagerClick}
                        className="text-indigo-400 hover:text-indigo-300 text-xs"
                      >
                        Edit
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 mt-1">
                      {isLoadingUsers ? (
                        <span className="text-xs text-gray-400">Loading users...</span>
                      ) : (
                        <>
                          <select
                            value={selectedManagerId}
                            onChange={(e) => setSelectedManagerId(e.target.value)}
                            className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs w-full"
                          >
                            <option value="">Select Manager...</option>
                            {availableUsers.map(user => (
                              <option key={user._id} value={user._id}>
                                {user.profile?.firstName || ''} {user.profile?.lastName || ''} ({user.username})
                              </option>
                            ))}
                          </select>
                          <div className="flex gap-2">
                            <button 
                              onClick={handleSaveManager}
                              disabled={!selectedManagerId}
                              className="bg-indigo-600 text-white px-2 py-1 rounded text-xs hover:bg-indigo-500"
                            >
                              Save
                            </button>
                            <button 
                              onClick={() => setIsEditingManager(false)}
                              className="bg-gray-600 text-white px-2 py-1 rounded text-xs hover:bg-gray-500"
                            >
                              Cancel
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-400">Start Date</dt>
                  <dd className="mt-1 text-sm text-white">{formatDate(project.startDate)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-400">End Date</dt>
                  <dd className="mt-1 text-sm text-white">{formatDate(project.endDate)}</dd>
                </div>
              </div>

              <div className="bg-gray-700/30 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">Resources</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm w-24">Project URL:</span>
                    {project.projectUrl ? (
                      <a href={project.projectUrl} target="_blank" rel="noreferrer" className="text-blue-400 text-sm hover:underline">{project.projectUrl}</a>
                    ) : <span className="text-gray-500 text-sm">N/A</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm w-24">Repository:</span>
                    {project.repositoryUrl ? (
                      <a href={project.repositoryUrl} target="_blank" rel="noreferrer" className="text-blue-400 text-sm hover:underline">{project.repositoryUrl}</a>
                    ) : <span className="text-gray-500 text-sm">N/A</span>}
                  </div>
                </div>
              </div>

              {project.technologies && project.technologies.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">Technologies</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech) => (
                      <span key={tech} className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TEAM TAB */}
          {activeTab === 'team' && (
            <div className="space-y-6">
              {/* Assign Intern Section */}
              <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-700">
                <h3 className="text-sm font-bold text-white mb-3">Assign Intern</h3>
                <form onSubmit={handleAssignIntern} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Intern</label>
                      <select 
                        value={selectedInternId} 
                        onChange={(e) => setSelectedInternId(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm"
                      >
                        <option value="">Select Intern...</option>
                        {availableInterns.map(intern => (
                          <option key={intern._id} value={intern._id}>
                            {intern.personalInfo.firstName} {intern.personalInfo.lastName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Role</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Frontend Dev"
                        value={assignRole}
                        onChange={(e) => setAssignRole(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Start Date</label>
                      <input 
                        type="date"
                        value={assignStartDate}
                        onChange={(e) => setAssignStartDate(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm"
                      />
                    </div>
                    <div className="flex items-end">
                      <button 
                        type="submit" 
                        disabled={isAssigning || !selectedInternId || !assignRole}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isAssigning ? 'Assigning...' : 'Assign'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Members List */}
              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-3">Current Team</h3>
                <div className="space-y-2">
                  {project.teamMembers && project.teamMembers.length > 0 ? (
                    project.teamMembers.map((member) => (
                      <div key={member._id || Math.random()} className="flex justify-between items-center bg-gray-700/50 px-4 py-3 rounded-lg">
                        <div>
                          <p className="font-medium text-white">{member.name}</p>
                          <p className="text-xs text-gray-400">{member.role} • Joined {formatDate(member.joinedAt)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs px-2 py-0.5 rounded ${member.memberType === 'Intern' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'}`}>
                            {member.memberType}
                          </span>
                          {member.memberType === 'Intern' && (
                            <button 
                              onClick={() => handleRemoveMember(
                                typeof member.memberId === 'string' ? member.memberId : (member.memberId as any)._id, 
                                member.memberType
                              )}
                              className="text-red-400 hover:text-red-300 p-1"
                              title="Remove from project"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm italic">No team members assigned.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* DOCUMENTS TAB */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              {/* Add Document Section */}
              <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-700">
                <h3 className="text-sm font-bold text-white mb-3">Add Document</h3>
                <form onSubmit={handleAddDocument} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Title</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Requirements Spec"
                        value={newDocTitle}
                        onChange={(e) => setNewDocTitle(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">File</label>
                      <input 
                        type="file"
                        onChange={(e) => setNewDocFile(e.target.files?.[0] || null)}
                        className="block w-full text-xs text-gray-400 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:bg-gray-600 file:text-white hover:file:bg-gray-500"
                      />
                    </div>
                  </div>
                  <button 
                    type="submit" 
                    disabled={isUploading || !newDocFile || !newDocTitle}
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? 'Uploading...' : 'Upload Document'}
                  </button>
                </form>
              </div>

              {/* Documents List */}
              <div className="space-y-2">
                {project.pdfDocuments && project.pdfDocuments.length > 0 ? (
                  project.pdfDocuments.map((doc, index) => (
                    <div key={index} className="flex justify-between items-center bg-gray-700/50 px-4 py-3 rounded-lg">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <svg className="w-5 h-5 text-red-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                        </svg>
                        <div className="min-w-0">
                          <a href={doc.url} target="_blank" rel="noreferrer" className="font-medium text-white hover:underline truncate block">
                            {doc.title}
                          </a>
                          <p className="text-xs text-gray-400">
                            Uploaded {formatDate(doc.uploadedAt)}
                            {doc.size ? ` • ${(doc.size / 1024).toFixed(1)} KB` : ''}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteDocument(index)}
                        className="text-gray-400 hover:text-red-400 p-2"
                        title="Delete Document"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-500 italic">
                    No documents uploaded yet.
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-10 bg-gray-800 px-6 py-4 flex justify-end rounded-b-lg border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}