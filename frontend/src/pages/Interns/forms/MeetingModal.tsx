// components/MeetingModal.tsx
import { useState, useEffect } from 'react';
import { type MeetingNoteAddedBy } from '../../../types';

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    date: string;
    title?: string;
    agenda?: string;
    notes: string;
    attendees?: string[];
    actionItems?: string[];
    nextMeetingDate?: string;
    addedBy: MeetingNoteAddedBy;
  }) => void;
  isLoading?: boolean;
  initialData?: {
    date?: string;
    title?: string;
    agenda?: string;
    notes?: string;
    attendees?: string[];
    actionItems?: string[];
    nextMeetingDate?: string;
  };
  mode?: 'add' | 'edit';
}

export default function MeetingModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  initialData,
  mode = 'add'
}: MeetingModalProps) {
  const [formData, setFormData] = useState({
    date: initialData?.date || new Date().toISOString().split('T')[0],
    title: initialData?.title || '',
    agenda: initialData?.agenda || '',
    notes: initialData?.notes || '',
    attendees: initialData?.attendees?.join(', ') || '',
    actionItems: initialData?.actionItems?.join(', ') || '',
    nextMeetingDate: initialData?.nextMeetingDate || ''
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        date: initialData?.date || new Date().toISOString().split('T')[0],
        title: initialData?.title || '',
        agenda: initialData?.agenda || '',
        notes: initialData?.notes || '',
        attendees: initialData?.attendees?.join(', ') || '',
        actionItems: initialData?.actionItems?.join(', ') || '',
        nextMeetingDate: initialData?.nextMeetingDate || ''
      });
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock addedBy data - in real app, this would come from auth context
    const addedBy: MeetingNoteAddedBy = {
      userId: 'current-user-id',
      userName: 'Current User',
      role: 'user'
    };

    const submitData = {
      date: formData.date,
      title: formData.title || undefined,
      agenda: formData.agenda || undefined,
      notes: formData.notes,
      attendees: formData.attendees ? formData.attendees.split(',').map(item => item.trim()).filter(item => item) : undefined,
      actionItems: formData.actionItems ? formData.actionItems.split(',').map(item => item.trim()).filter(item => item) : undefined,
      nextMeetingDate: formData.nextMeetingDate || undefined,
      addedBy
    };

    onSubmit(submitData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-800 to-gray-700 p-6 text-white">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">
              {mode === 'add' ? 'Add Meeting Note' : 'Edit Meeting Note'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-300 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
              disabled={isLoading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Date & Title */}
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label text-sm text-gray-300 mb-2 block font-medium">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-white"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label text-sm text-gray-300 mb-2 block font-medium">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-white"
                  required
                  placeholder="Meeting title..."
                />
              </div>
            </div>

            {/* Agenda */}
            <div className="form-group">
              <label className="form-label text-sm text-gray-300 mb-2 block font-medium">
                Agenda
              </label>
              <textarea
                value={formData.agenda}
                onChange={(e) => handleChange('agenda', e.target.value)}
                rows={2}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-white resize-none"
                placeholder="Meeting agenda..."
              />
            </div>

            {/* Notes */}
            <div className="form-group">
              <label className="form-label text-sm text-gray-300 mb-2 block font-medium">
                Notes <span className="text-red-400">*</span>
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={3}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-white resize-none"
                required
                placeholder="Meeting notes..."
              />
            </div>

            {/* Attendees */}
            <div className="form-group">
              <label className="form-label text-sm text-gray-300 mb-2 block font-medium">
                Attendees (comma-separated)
              </label>
              <input
                type="text"
                value={formData.attendees}
                onChange={(e) => handleChange('attendees', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-white"
                placeholder="John Doe, Jane Smith..."
              />
            </div>

            {/* Action Items */}
            <div className="form-group">
              <label className="form-label text-sm text-gray-300 mb-2 block font-medium">
                Action Items (comma-separated)
              </label>
              <input
                type="text"
                value={formData.actionItems}
                onChange={(e) => handleChange('actionItems', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-white"
                placeholder="Complete task A, Review document B..."
              />
            </div>

            {/* Next Meeting Date */}
            <div className="form-group">
              <label className="form-label text-sm text-gray-300 mb-2 block font-medium">
                Next Meeting Date
              </label>
              <input
                type="date"
                value={formData.nextMeetingDate}
                onChange={(e) => handleChange('nextMeetingDate', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-white"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700 text-gray-300 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || !formData.notes.trim() || !formData.title.trim()}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {mode === 'add' ? 'Adding...' : 'Updating...'}
                </div>
              ) : (
                mode === 'add' ? 'Add Meeting Note' : 'Update Meeting Note'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}