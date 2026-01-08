// LearningResource.model.ts - Fixed version
import mongoose, { Document, Schema } from 'mongoose';

export interface ILearningResource extends Document {
  title: string;
  description?: string;
  category: 'Tutorial' | 'Article' | 'Video' | 'Course' | 'Documentation';
  url: string;
  tags?: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  createdBy: {
    userId: mongoose.Types.ObjectId;
    userName: string;
    email: string;
  };
  updatedBy?: {
    userId: mongoose.Types.ObjectId;
    userName: string;
    email: string;
  };
  isActive: boolean;
  views: number;
  likes: number;
  likedBy: mongoose.Types.ObjectId[]; // Track users who liked this resource
  viewedBy: { // Track users who viewed this resource
    user: mongoose.Types.ObjectId;
    viewedAt: Date;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}

const LearningResourceSchema: Schema<ILearningResource> = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    category: {
      type: String,
      enum: ['Tutorial', 'Article', 'Video', 'Course', 'Documentation'],
      required: true
    },
    url: { type: String, required: true },
    tags: { type: [String], default: [] },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner'
    },
    createdBy: {
      userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      userName: String,
      email: String
    },
    updatedBy: {
      userId: { type: Schema.Types.ObjectId, ref: 'User' },
      userName: String,
      email: String
    },
    isActive: { type: Boolean, default: true },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    likedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }], // Array of user IDs who liked
    viewedBy: [{ 
      user: { type: Schema.Types.ObjectId, ref: 'User' },
      viewedAt: { type: Date, default: Date.now }
    }],
  },
  { timestamps: true }
);

// Index for better performance
LearningResourceSchema.index({ category: 1, difficulty: 1 });
LearningResourceSchema.index({ tags: 1 });
LearningResourceSchema.index({ 'createdBy.userId': 1 });
LearningResourceSchema.index({ 'likedBy': 1 });
LearningResourceSchema.index({ 'viewedBy.user': 1 });

const LearningResource = mongoose.model<ILearningResource>('LearningResource', LearningResourceSchema);

export default LearningResource;