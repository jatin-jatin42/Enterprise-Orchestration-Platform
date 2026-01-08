import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { type AddPerformanceReviewData } from '../../../types';

interface PerformanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: AddPerformanceReviewData) => void;
    isLoading: boolean;
    initialData?: Partial<AddPerformanceReviewData>;
    isEdit?: boolean;
}

export default function PerformanceModal({ 
    isOpen, 
    onClose, 
    onSubmit, 
    isLoading, 
    initialData, 
    isEdit = false 
}: PerformanceModalProps) {
    const [formData, setFormData] = useState({
        overallRating: 0,
        punctuality: 0,
        codeQuality: 0,
        communication: 0,
        teamwork: 0,
        rating: 0,
        feedback: '',
        reviewDate: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                overallRating: initialData.overallRating || 0,
                punctuality: initialData.punctuality || 0,
                codeQuality: initialData.codeQuality || 0,
                communication: initialData.communication || 0,
                teamwork: initialData.teamwork || 0,
                rating: initialData.rating || 0,
                feedback: initialData.feedback || '',
                reviewDate: initialData.reviewDate || new Date().toISOString().split('T')[0],
            });
        } else {
            // Reset form when opening for new review
            setFormData({
                overallRating: 0,
                punctuality: 0,
                codeQuality: 0,
                communication: 0,
                teamwork: 0,
                rating: 0,
                feedback: '',
                reviewDate: new Date().toISOString().split('T')[0],
            });
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate ratings (1-5)
        const ratings = [
            formData.overallRating,
            formData.punctuality,
            formData.codeQuality,
            formData.communication,
            formData.teamwork,
            formData.rating
        ];
        
        const invalidRatings = ratings.filter(rating => rating < 1 || rating > 5);
        if (invalidRatings.length > 0) {
            toast.error('All ratings must be between 1 and 5');
            return;
        }

        // Validate that at least one rating is provided
        if (ratings.every(rating => rating === 0)) {
            toast.error('Please provide at least one rating');
            return;
        }

        onSubmit(formData);
    };

    const handleRatingChange = (field: string, value: number) => {
        if (value < 0) value = 0;
        if (value > 5) value = 5;
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleInputChange = (field: string, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-gray-800 rounded-xl w-full max-w-md border border-gray-700 shadow-2xl">
                <div className="p-6 border-b border-gray-700">
                    <h3 className="text-xl font-semibold text-white">
                        {isEdit ? 'Edit Performance Review' : 'Add Performance Review'}
                    </h3>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Review Date *
                        </label>
                        <input
                            type="date"
                            value={formData.reviewDate}
                            onChange={(e) => handleInputChange('reviewDate', e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                    </div>

                    {/* Overall Rating */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Overall Rating *
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                min="1"
                                max="5"
                                value={formData.overallRating || ''}
                                onChange={(e) => handleRatingChange('overallRating', parseInt(e.target.value) || 0)}
                                className="w-20 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                            <span className="text-gray-400 text-sm">(1-5)</span>
                        </div>
                    </div>

                    {/* Individual Ratings */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Punctuality *
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="5"
                                value={formData.punctuality || ''}
                                onChange={(e) => handleRatingChange('punctuality', parseInt(e.target.value) || 0)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Code Quality *
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="5"
                                value={formData.codeQuality || ''}
                                onChange={(e) => handleRatingChange('codeQuality', parseInt(e.target.value) || 0)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Communication *
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="5"
                                value={formData.communication || ''}
                                onChange={(e) => handleRatingChange('communication', parseInt(e.target.value) || 0)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Teamwork *
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="5"
                                value={formData.teamwork || ''}
                                onChange={(e) => handleRatingChange('teamwork', parseInt(e.target.value) || 0)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                        </div>
                    </div>

                    {/* Review Rating */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Review Rating *
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                min="1"
                                max="5"
                                value={formData.rating || ''}
                                onChange={(e) => handleRatingChange('rating', parseInt(e.target.value) || 0)}
                                className="w-20 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                            <span className="text-gray-400 text-sm">(1-5)</span>
                        </div>
                    </div>

                    {/* Feedback */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Feedback *
                        </label>
                        <textarea
                            value={formData.feedback}
                            onChange={(e) => handleInputChange('feedback', e.target.value)}
                            rows={4}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter detailed feedback..."
                            required
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-500 transition-colors"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Saving...' : (isEdit ? 'Update' : 'Add')} Review
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}