//backend/src/controllers/learningResource.controller.ts
import { Request, Response } from 'express';
import LearningResource from '@/models/LearningResource.model';
import { AuthRequest } from '@/middleware/auth.middleware';

export const getAllResources = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { category, difficulty, search, page = '1', limit = '10' } = req.query;
    // const authReq = req as AuthRequest;
    const userId = req.user?._id;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { isActive: true };

    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search as string, 'i')] } }
      ];
    }

    const total = await LearningResource.countDocuments(query);

    const resources = await LearningResource.find(query)
      .sort({ createdAt: -1 })
      .skip((parseInt(page as string) - 1) * parseInt(limit as string))
      .limit(parseInt(limit as string));

    // Add like and view status for current user
    const resourcesWithStatus = resources.map(resource => {
      const resourceObj = resource.toObject();
      const isLiked = userId ? resource.likedBy.some(id => id.equals(userId)) : false;
      const hasViewed = userId ? resource.viewedBy.some((view: any) => view.user.equals(userId)) : false;

      return {
        ...resourceObj,
        isLiked,
        hasViewed // Optional: if you want to track viewed status in frontend
      };
    });

    return res.status(200).json({
      success: true,
      data: resourcesWithStatus,
      pagination: {
        currentPage: parseInt(page as string),
        totalPages: Math.ceil(total / parseInt(limit as string)),
        totalItems: total,
        itemsPerPage: parseInt(limit as string)
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ success: false, message: 'Failed to fetch resources', error: errorMessage });
  }
};

export const getResourceById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const resource = await LearningResource.findById(req.params.id);
    if (!resource || !resource.isActive) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    const authReq = req as AuthRequest;
    const userId = authReq.user?._id;

    const isLiked = userId ? resource.likedBy.some(id => id.equals(userId)) : false;
    const hasViewed = userId ? resource.viewedBy.some((view: any) => view.user.equals(userId)) : false;

    const resourceWithStatus = {
      ...resource.toObject(),
      isLiked,
      hasViewed
    };

    // Only increment views for authenticated users who haven't viewed before
    if (userId && !hasViewed) {
      resource.views = (resource.views || 0) + 1;
      resource.viewedBy.push({
        user: userId,
        viewedAt: new Date()
      });

      // Save asynchronously (not blocking response)
      resource.save().catch((err: Error) => {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to update resource views:', err.message);
        }
      });
    }

    return res.status(200).json({ success: true, data: resourceWithStatus });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ success: false, message: 'Failed to fetch resource', error: errorMessage });
  }
};

export const createResource = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { title, description, category, url, tags, difficulty } = req.body;

    const resource = new LearningResource({
      title,
      description,
      category,
      url,
      tags,
      difficulty,
      createdBy: {
        userId: req.user?._id,
        userName: req.user?.username,
        email: req.user?.email,
      },
      isActive: true,
      views: 0,
      likes: 0,
    });

    await resource.save();

    return res.status(201).json({ success: true, message: 'Resource created', data: resource });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ success: false, message: 'Failed to create resource', error: errorMessage });
  }
};

export const updateResource = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { title, description, category, url, tags, difficulty } = req.body;

    const resource = await LearningResource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    // Check ownership is handled by middleware

    resource.title = title || resource.title;
    resource.description = description || resource.description;
    resource.category = category || resource.category;
    resource.url = url || resource.url;
    resource.tags = tags || resource.tags;
    resource.difficulty = difficulty || resource.difficulty;
    if (req.user) {
      resource.updatedBy = {
        userId: req.user._id,
        userName: req.user.username,
        email: req.user.email,
      };
    }

    await resource.save();

    return res.status(200).json({ success: true, message: 'Resource updated', data: resource });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ success: false, message: 'Failed to update resource', error: errorMessage });
  }
};

export const deleteResource = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const resource = await LearningResource.findById(req.params.id);
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });

    resource.isActive = false;
    await resource.save();

    return res.status(200).json({ success: true, message: 'Resource deleted' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ success: false, message: 'Failed to delete resource', error: errorMessage });
  }
};

export const likeResource = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const resource = await LearningResource.findById(req.params.id);
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });

    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    // Check if user already liked
    const hasLiked = resource.likedBy.includes(userId);

    if (hasLiked) {
      // Unlike: remove user from likedBy and decrement likes
      resource.likedBy = resource.likedBy.filter(id => !id.equals(userId));
      resource.likes = Math.max(0, (resource.likes || 1) - 1);
    } else {
      // Like: add user to likedBy and increment likes
      resource.likedBy.push(userId);
      resource.likes = (resource.likes || 0) + 1;
    }

    await resource.save();

    return res.status(200).json({
      success: true,
      message: hasLiked ? 'Resource unliked' : 'Resource liked',
      likes: resource.likes,
      isLiked: !hasLiked
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ success: false, message: 'Failed to like resource', error: errorMessage });
  }
};


export const trackView = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const resource = await LearningResource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    const userId = req.user?._id;

    let viewIncremented = false;

    if (userId) {
      // For authenticated users: check if already viewed
      const hasViewed = resource.viewedBy.some((view: any) => view.user.equals(userId));

      if (!hasViewed) {
        resource.views = (resource.views || 0) + 1;
        resource.viewedBy.push({
          user: userId,
          viewedAt: new Date()
        });
        viewIncremented = true;
        await resource.save();
      }
    } else {
      // For unauthenticated users: always increment
      // (Consider IP-based tracking in the future for better accuracy)
      resource.views = (resource.views || 0) + 1;
      viewIncremented = true;
      await resource.save();
    }

    return res.status(200).json({
      success: true,
      message: viewIncremented ? 'View tracked successfully' : 'Already viewed',
      views: resource.views,
      viewIncremented // Add this to help frontend know if view was actually counted
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ success: false, message: 'Failed to track view', error: errorMessage });
  }
};
