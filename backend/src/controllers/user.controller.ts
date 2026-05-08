//backend/src/controllers/user.controller.ts

import { Request, Response } from 'express';
import User, { IUser } from '@/models/User.model';
import { generatePassword, sanitizeUser } from '@/utils/helpers';

interface AuthRequest extends Request {
  user?: IUser;
}

// Get all users (Admin only)
export const getAllUsers = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { search, role, isActive, page = 1, limit = 10 } = req.query;
    const query: any = {};

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'profile.firstName': { $regex: search, $options: 'i' } },
        { 'profile.lastName': { $regex: search, $options: 'i' } }
      ];
    }
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const total = await User.countDocuments(query);

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((+page - 1) * +limit)
      .limit(+limit);

    return res.status(200).json({
      success: true,
      data: users,
      pagination: {
        currentPage: +page,
        totalPages: Math.ceil(total / +limit),
        totalItems: total,
        itemsPerPage: +limit
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ success: false, message: 'Failed to fetch users', error: errorMessage });
  }
};

// Get a single user by ID
export const getUserById = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Allow users to view their own profile; admin can view any
    if (req.user?.role !== 'admin' && req.user?._id.toString() !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ success: false, message: 'Failed to fetch user', error: errorMessage });
  }
};

// Create a new user (Admin only)
export const createUser = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { username, email, password, role, profile } = req.body;

    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Username or email already exists' });
    }

    const userPassword = password || generatePassword();

    const newUser = new User({
      username,
      email,
      password: userPassword,
      role: role || 'user',
      profile
    });
    await newUser.save();

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: sanitizeUser(newUser),
      ...(password ? {} : { generatedPassword: userPassword })
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ success: false, message: 'Failed to create user', error: errorMessage });
  }
};

// Update a user (Admin or self)
export const updateUser = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (req.user?.role !== 'admin' && req.user?._id.toString() !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { username, email, role, profile, isActive, phone, department, position, bio } = req.body;

    if (req.user?.role !== 'admin') {
      delete req.body.role;
      delete req.body.isActive;
    }

    if (username) user.username = username;
    if (email) user.email = email;
   
    // Handle both nested profile object and top-level fields
    if (profile) {
      user.profile = { ...user.profile, ...profile };
    } else {
      // Support top-level profile fields
      if (phone) user.profile.phone = phone;
      if (department) user.profile.department = department;
      if (position) user.profile.position = position;      // ✅ NEW - Added
      if (bio) user.profile.bio = bio;                     // ✅ NEW - Added
    }
   
    if (role && req.user.role === 'admin') user.role = role;
    if (isActive !== undefined && req.user.role === 'admin') user.isActive = isActive;

    await user.save();

    return res.status(200).json({ success: true, message: 'User updated', data: sanitizeUser(user) });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ success: false, message: 'Failed to update user', error: errorMessage });
  }
};

// Soft delete (deactivate) user (Admin only)
export const deleteUser = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (req.user?._id.toString() === req.params.id) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isActive = false;
    await user.save();

    return res.status(200).json({ success: true, message: 'User deactivated' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ success: false, message: 'Failed to delete user', error: errorMessage });
  }
};

// Reset user password (Admin only)
export const resetPassword = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const user = await User.findById(req.params.id).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const newPassword = req.body.password || generatePassword();

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully',
      newPassword: req.body.password ? undefined : newPassword
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ success: false, message: 'Failed to reset password', error: errorMessage });
  }
};

// Update user settings (own only)
export const updateSettings = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (req.user?._id.toString() !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update these settings' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.set({ settings: { ...user.get('settings'), ...req.body } });
    await user.save();

    return res.status(200).json({ success: true, message: 'Settings updated', data: user.settings });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ success: false, message: 'Failed to update settings', error: errorMessage });
  }
};

// ✅ NEW FUNCTIONS ADDED - Upload and Delete Documents

// Upload document for user
export const uploadDocument = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.params.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Check authorization
    if (req.user?.role !== 'admin' && req.user?._id.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // ✅ Convert file to Base64 and store in MongoDB
    const fileBase64 = file.buffer.toString('base64');
   
    const document = {
      fileName: file.originalname,
      fileUrl: `data:${file.mimetype};base64,${fileBase64}`, // ✅ Store as data URL
      fileType: file.mimetype,
      fileSize: file.size,
      uploadedAt: new Date()
    };

    // Add to user's documents array
    if (!user.documents) {
      user.documents = [];
    }
    user.documents.push(document);
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        fileName: document.fileName,
        fileType: document.fileType,
        fileSize: document.fileSize,
        uploadedAt: document.uploadedAt
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ success: false, message: 'Failed to upload document', error: errorMessage });
  }
};

// Delete document for user
export const deleteDocument = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { id: userId, fileName } = req.params;

    // Check authorization
    if (req.user?.role !== 'admin' && req.user?._id.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Find and remove document from MongoDB
    const docIndex = user.documents?.findIndex(doc => doc.fileName === decodeURIComponent(fileName as string));
    if (docIndex === undefined || docIndex === -1) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // ✅ Remove from database only (no filesystem cleanup needed)
    user.documents!.splice(docIndex, 1);
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Delete error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ success: false, message: 'Failed to delete document', error: errorMessage });
  }
};
