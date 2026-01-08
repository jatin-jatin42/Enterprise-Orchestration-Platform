import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { api } from '../../services/api';
import { ArrowLeft, Edit2, X, Check, Upload, File, Trash2, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const profileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  bio: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface Document {
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
}

export default function Profile() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
      phone: '',
      department: '',
      position: '',
      bio: '',
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?._id) return;

      try {
        setIsLoading(true);
        const response = await api.get(`/users/${user._id}`);
        if (response.data.success) {
          const userData = response.data.data;
          reset({
            username: userData.username || '',
            email: userData.email || '',
            phone: userData.profile?.phone || '',
            department: userData.profile?.department || '',
            position: userData.profile?.position || '',
            bio: userData.profile?.bio || '',
          });
          setDocuments(userData.documents || []);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user?._id, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!user?._id) {
      toast.error('User not found');
      return;
    }

    try {
      const response = await api.put(`/users/${user._id}`, data);

      if (response.data.success) {
        toast.success('Profile updated successfully');
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?._id) return;

    e.target.value = '';

    const formData = new FormData();
    formData.append('document', file);

    try {
      setIsUploading(true);
      const response = await api.post(`/users/${user._id}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        const userResponse = await api.get(`/users/${user._id}`);
        if (userResponse.data.success) {
          setDocuments(userResponse.data.data.documents || []);
          toast.success('Document uploaded successfully');
        }
      }
    } catch (error) {
      console.error('Failed to upload document:', error);
      toast.error('Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (fileName: string) => {
    if (!user?._id) return;

    try {
      const response = await api.delete(`/users/${user._id}/documents/${encodeURIComponent(fileName)}`);
      if (response.data.success) {
        setDocuments(documents.filter(doc => doc.fileName !== fileName));
        toast.success('Document deleted');
      }
    } catch (error) {
      console.error('Failed to delete document:', error);
      toast.error('Failed to delete document');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className=" bg-gray-900 text-white p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 max-w-2xl mx-auto">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-xl font-bold">Profile</h1>
        </div>
      </div>

      {/* Single centered container */}
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            {/* Profile Header */}
            <div className="bg-linear-to-r from-blue-600 to-purple-600 p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-xl font-bold border border-white/30">
                  {user?.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h2 className="text-lg font-bold">{user?.username}</h2>
                  <p className="text-blue-100 text-xs capitalize">{user?.role}</p>
                </div>
              </div>
            </div>

            {/* Form Grid */}
            <div className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Username */}
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-300">Username</label>
                  <input
                    type="text"
                    {...register('username')}
                    disabled={!isEditing}
                    className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                  {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username.message}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-300">Email</label>
                  <input
                    type="email"
                    {...register('email')}
                    disabled={!isEditing}
                    className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-300">Phone</label>
                  <input
                    type="tel"
                    {...register('phone')}
                    disabled={!isEditing}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 placeholder-gray-500"
                  />
                </div>

                {/* Department */}
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-300">Department</label>
                  <input
                    type="text"
                    {...register('department')}
                    disabled={!isEditing}
                    placeholder="Engineering"
                    className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 placeholder-gray-500"
                  />
                </div>
              </div>

              {/* ✅ EQUAL 50/50 LAYOUT: Position & Bio (Left) | Documents + Buttons (Right) */}
              <div className="flex flex-col lg:flex-row gap-4 mt-4">
                {/* Left Side: Position & Bio - 50% */}
                <div className="flex-1 lg:w-1/2 space-y-3">
                  {/* Position */}
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-300">Position</label>
                    <input
                      type="text"
                      {...register('position')}
                      disabled={!isEditing}
                      placeholder="Software Engineer"
                      className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 placeholder-gray-500"
                    />
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-300">Bio</label>
                    <textarea
                      {...register('bio')}
                      disabled={!isEditing}
                      rows={3}
                      placeholder="Tell us about yourself..."
                      className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 resize-none placeholder-gray-500"
                    />
                  </div>
                </div>

                {/* Right Side: Documents + Save/Cancel OR Edit Button - 50% */}
                <div className="flex-1 lg:w-1/2 space-y-3">
                  {/* Documents Card */}
                  <div className="bg-gray-900 rounded-lg border border-gray-700 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-semibold">Documents</h3>
                      <label className="cursor-pointer">
                        <div className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-colors">
                          <Upload size={12} />
                          <span>{isUploading ? 'Uploading...' : 'Upload'}</span>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleFileUpload}
                          disabled={isUploading}
                          accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                        />
                      </label>
                    </div>

                    {/* Documents List */}
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {documents.length === 0 ? (
                        <p className="text-xs text-gray-500 text-center py-4">No documents uploaded</p>
                      ) : (
                        documents.map((doc, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-1.5 bg-gray-800 rounded border border-gray-700 hover:border-gray-600 transition-colors"
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <File size={12} className="text-blue-400 shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium truncate">{doc.fileName}</p>
                                <p className="text-xs text-gray-500">{formatFileSize(doc.fileSize)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-0.5 shrink-0">
                              <a
                                href={doc.fileUrl}
                                download={doc.fileName}
                                className="p-0.5 hover:bg-blue-500/10 rounded text-blue-400 hover:text-blue-300 transition-colors"
                                title="Download"
                              >
                                <Download size={11} />
                              </a>
                              <button
                                onClick={() => handleDeleteDocument(doc.fileName)}
                                className="p-0.5 hover:bg-red-500/10 rounded text-red-400 hover:text-red-300 transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* ✅ Conditional: Edit Profile Button OR Save/Cancel Buttons */}
                  {!isEditing ? (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      <Edit2 size={14} />
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          reset();
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
                      >
                        <X size={14} />
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <LoadingSpinner size="sm" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Check size={14} />
                            Save
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
