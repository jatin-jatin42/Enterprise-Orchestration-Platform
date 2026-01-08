import mongoose, { Document, Schema, CallbackError } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'mentor' | 'user';
  profile: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
    phone?: string;
    department?: string;
    position?: string;
    bio?: string;
  };
  documents?: {                  // ✅ NEW - Added
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    uploadedAt: Date;
  }[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  settings?: {
    notifications?: object;
    display?: object;
    privacy?: object;
    theme?: object;
    [key: string]: any;
  };
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['admin', 'mentor', 'user'], default: 'user' },
    profile: {
      firstName: { type: String, trim: true },
      lastName: { type: String, trim: true },
      avatar: { type: String },
      phone: { type: String },
      department: { type: String },
      position: {type: String},
      bio: { type: String }
    },
    documents: [{                           // ✅ NEW - Added documents array
      fileName: { type: String, required: true },
      fileUrl: { type: String, required: true },
      fileType: { type: String },
      fileSize: { type: Number },
      uploadedAt: { type: Date, default: Date.now }
    }],
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date }
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err as CallbackError);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUser>('User', UserSchema);

export default User;