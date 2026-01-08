import { Request, Response } from 'express';
import Intern from '@/models/Intern.model';
import { AuthRequest } from '@/middleware/auth.middleware';
import User from "../models/User.model";

export const getAllInterns = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { status, department, search, page = '1', limit = '10' } = req.query;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { isActive: true };

    if (status) query['internshipDetails.status'] = status;
    if (department) query['internshipDetails.department'] = department;
    if (search) {
      query.$or = [
        { 'personalInfo.firstName': { $regex: search, $options: 'i' } },
        { 'personalInfo.lastName': { $regex: search, $options: 'i' } },
        { 'personalInfo.email': { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Intern.countDocuments(query);

    const interns = await Intern.find(query)
      .sort({ createdAt: -1 })
      .skip((parseInt(page as string) - 1) * parseInt(limit as string))
      .limit(parseInt(limit as string));

    return res.status(200).json({
      success: true,
      data: interns,
      pagination: {
        currentPage: parseInt(page as string),
        totalPages: Math.ceil(total / parseInt(limit as string)),
        totalItems: total,
        itemsPerPage: parseInt(limit as string)
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ success: false, message: 'Failed to fetch interns', error: errorMessage });
  }
};

export const getInternById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const intern = await Intern.findById(req.params.id);
    if (!intern || !intern.isActive) {
      return res.status(404).json({ success: false, message: 'Intern not found' });
    }

    return res.status(200).json({ success: true, data: intern });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ success: false, message: 'Failed to fetch intern', error: errorMessage });
  }
};

export const createIntern = async (req: Request, res: Response) => {
  try {
    const { personalInfo, internshipDetails } = req.body;

    if (!personalInfo || !internshipDetails) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid payload format" 
      });
    }

    const { firstName, lastName, email, phone } = personalInfo;
    const { startDate, endDate, department, position, status } = internshipDetails;

    // 1️⃣ Check if User already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists"
      });
    }

    // 2️⃣ Check if Intern already exists
    const existingIntern = await Intern.findOne({ "personalInfo.email": email });
    if (existingIntern) {
      return res.status(409).json({
        success: false,
        message: "Intern with this email already exists"
      });
    }

    // 3️⃣ Generate unique username
    const baseUsername = firstName.toLowerCase().replace(/\s+/g, "");
    let username = baseUsername;
    let count = 1;

    while (await User.findOne({ username })) {
      username = `${baseUsername}${count}`;
      count++;
    }

    // 4️⃣ Prepare temporary password
    const phoneStr = String(phone);
    const last4 = phoneStr.slice(-4);
    const firstNameStr = firstName.toLowerCase().replace(/\s+/g, "");
    const finalPassword = `${last4}${firstNameStr}`;

    // 5️⃣ Create User
    const newUser = await User.create({
      username,
      email,
      password: finalPassword,
      role: "user",
      profile: {
        firstName,
        lastName,
        phone,
        department,
      },
      isActive: true,
    });

    // 6️⃣ Create Intern
    const newIntern = await Intern.create({
      personalInfo: {
        firstName,
        lastName,
        email,
        phone,
        profileImage: personalInfo.profileImage || null,
        dateOfBirth: personalInfo.dateOfBirth || null,
        address: personalInfo.address || null,
      },
      internshipDetails: {
        startDate,
        endDate,
        department,
        position,
        status: status || "Active",
        duration: internshipDetails.duration || null,
        mentor: internshipDetails.mentor || null,
      },
      isActive: true,
      createdBy: newUser._id,
    });

    return res.status(201).json({
      success: true,
      message: "Intern created successfully",
      data: newIntern
    });

  } catch (error: any) {

    // 🟥 Mongoose Duplicate Key
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate entry detected",
        error: error.keyValue
      });
    }

    // 🟥 Mongoose Validation Error
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        error: Object.values(error.errors).map((err: any) => err.message)
      });
    }

    // 🟥 Cast Error (invalid ObjectId, date, etc.)
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid data format",
        error: error.message
      });
    }

    // 🟥 Generic 500
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

export const updateIntern = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    // Admin only middleware applied
    const intern = await Intern.findById(req.params.id);
    if (!intern) {
      return res.status(404).json({ success: false, message: 'Intern not found' });
    }

    Object.assign(intern, req.body);
    intern.updatedBy = req.user?._id;

    await intern.save();

    return res.status(200).json({ success: true, message: 'Intern updated', data: intern });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ success: false, message: 'Failed to update intern', error: errorMessage });
  }
};

export const deleteIntern = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    // Soft delete
    const intern = await Intern.findById(req.params.id);
    if (!intern) {
      return res.status(404).json({ success: false, message: 'Intern not found' });
    }

    intern.isActive = false;
    await intern.save();

    return res.status(200).json({ success: true, message: 'Intern deleted' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ success: false, message: 'Failed to delete intern', error: errorMessage });
  }
};

export const addDailyComment = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const intern = await Intern.findById(req.params.id);
    if (!intern) return res.status(404).json({ success: false, message: 'Intern not found' });

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const comment = {
      date: req.body.date || new Date(),
      comment: req.body.comment,
      taskDescription: req.body.taskDescription,
      hoursWorked: req.body.hoursWorked,
      status: req.body.status,
      addedBy: {
        userId: req.user._id,
        userName: req.user.username,
        role: req.user.role
      }
    };

    intern.dailyComments = intern.dailyComments || [];
    intern.dailyComments.push(comment);

    await intern.save();

    return res.status(201).json({ success: true, message: 'Daily comment added', data: intern });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ success: false, message: 'Failed to add comment', error: errorMessage });
  }
};

export const addMeetingNote = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const intern = await Intern.findById(req.params.id);
    if (!intern) return res.status(404).json({ success: false, message: 'Intern not found' });

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const note = {
      date: req.body.date || new Date(),
      title: req.body.title,
      agenda: req.body.agenda,
      notes: req.body.notes,
      attendees: req.body.attendees,
      actionItems: req.body.actionItems,
      nextMeetingDate: req.body.nextMeetingDate,
      addedBy: {
        userId: req.user._id,
        userName: req.user.username,
        role: req.user.role
      }
    };

    intern.meetingNotes = intern.meetingNotes || [];
    intern.meetingNotes.push(note);

    await intern.save();

    return res.status(201).json({ success: true, message: 'Meeting note added', data: intern });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ success: false, message: 'Failed to add meeting note', error: errorMessage });
  }
};

export const addProject = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    // Admin only middleware applied
    const intern = await Intern.findById(req.params.id);
    if (!intern) return res.status(404).json({ success: false, message: 'Intern not found' });

    intern.projects = intern.projects || [];
    intern.projects.push(req.body);

    await intern.save();

    return res.status(201).json({ success: true, message: 'Project added', data: intern });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ success: false, message: 'Failed to add project', error: errorMessage });
  }
};



// Add these methods to your existing intern.controller.ts

export const addPerformanceReview = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const intern = await Intern.findById(req.params.id);
    if (!intern) {
      return res.status(404).json({ success: false, message: 'Intern not found' });
    }

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Validate rating ranges (1-5)
    const validateRating = (rating: number | undefined, fieldName: string) => {
      if (rating && (rating < 1 || rating > 5)) {
        throw new Error(`${fieldName} must be between 1 and 5`);
      }
    };

    validateRating(req.body.overallRating, 'Overall rating');
    validateRating(req.body.punctuality, 'Punctuality');
    validateRating(req.body.codeQuality, 'Code quality');
    validateRating(req.body.communication, 'Communication');
    validateRating(req.body.teamwork, 'Teamwork');
    validateRating(req.body.rating, 'Review rating');

    const review = {
      reviewDate: req.body.reviewDate || new Date(),
      rating: req.body.rating,
      feedback: req.body.feedback,
      reviewedBy: {
        userId: req.user._id,
        name: req.user.username 
      },
    };

    // Initialize performance object if it doesn't exist
    if (!intern.performance) {
      intern.performance = {
        overallRating: 0,
        punctuality: 0,
        codeQuality: 0,
        communication: 0,
        teamwork: 0,
        lastReviewDate: new Date(),
        reviews: [],
      };
    }

    // Initialize reviews array if it doesn't exist
    if (!intern.performance.reviews) {
      intern.performance.reviews = [];
    }

    // Add the new review
    intern.performance.reviews.push(review);

    // Update performance metrics
    if (req.body.overallRating !== undefined) {
      intern.performance.overallRating = req.body.overallRating;
    }
    if (req.body.punctuality !== undefined) {
      intern.performance.punctuality = req.body.punctuality;
    }
    if (req.body.codeQuality !== undefined) {
      intern.performance.codeQuality = req.body.codeQuality;
    }
    if (req.body.communication !== undefined) {
      intern.performance.communication = req.body.communication;
    }
    if (req.body.teamwork !== undefined) {
      intern.performance.teamwork = req.body.teamwork;
    }

    // Update last review date
    intern.performance.lastReviewDate = new Date();

    await intern.save();

    return res.status(201).json({
      success: true,
      message: 'Performance review added successfully',
      data: intern.performance,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({
      success: false,
      message: 'Failed to add performance review',
      error: errorMessage,
    });
  }
};

export const updatePerformanceReview = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { id, reviewId } = req.params;
    const intern = await Intern.findById(id);
    
    if (!intern) {
      return res.status(404).json({ success: false, message: 'Intern not found' });
    }

    if (!intern.performance || !intern.performance.reviews) {
      return res.status(404).json({ success: false, message: 'No performance reviews found' });
    }

    // Find the review to update
    const reviewIndex = intern.performance.reviews.findIndex(
      (review: any) => review._id?.toString() === reviewId
    );

    if (reviewIndex === -1) {
      return res.status(404).json({ success: false, message: 'Performance review not found' });
    }

    // Update review fields
    if (req.body.rating !== undefined) {
      intern.performance.reviews[reviewIndex].rating = req.body.rating;
    }
    if (req.body.feedback !== undefined) {
      intern.performance.reviews[reviewIndex].feedback = req.body.feedback;
    }
    if (req.body.reviewDate !== undefined) {
      intern.performance.reviews[reviewIndex].reviewDate = req.body.reviewDate;
    }

    // Update overall performance metrics if provided
    if (req.body.overallRating !== undefined) {
      intern.performance.overallRating = req.body.overallRating;
    }
    if (req.body.punctuality !== undefined) {
      intern.performance.punctuality = req.body.punctuality;
    }
    if (req.body.codeQuality !== undefined) {
      intern.performance.codeQuality = req.body.codeQuality;
    }
    if (req.body.communication !== undefined) {
      intern.performance.communication = req.body.communication;
    }
    if (req.body.teamwork !== undefined) {
      intern.performance.teamwork = req.body.teamwork;
    }

    intern.performance.lastReviewDate = new Date();

    await intern.save();

    return res.status(200).json({
      success: true,
      message: 'Performance review updated successfully',
      data: intern.performance,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({
      success: false,
      message: 'Failed to update performance review',
      error: errorMessage,
    });
  }
};

export const getPerformance = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const intern = await Intern.findById(req.params.id).select('performance');
    
    if (!intern) {
      return res.status(404).json({ success: false, message: 'Intern not found' });
    }

    return res.status(200).json({
      success: true,
      data: intern.performance || {},
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch performance data',
      error: errorMessage,
    });
  }
};
