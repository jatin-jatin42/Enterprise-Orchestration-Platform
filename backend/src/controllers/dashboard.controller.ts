// backend/src/controllers/dashboard.controller.ts
import { Request, Response, NextFunction } from 'express';
import Intern from '@/models/Intern.model';
import Project from '@/models/Project.model';
import LearningResource from '@/models/LearningResource.model';
import ToolResource from '@/models/ToolResource.model';

export const getDashboardStats = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Fetch Counts in Parallel
    const [
      activeInternsCount,
      learningResourcesCount,
      toolsCount,
      projectsCount
    ] = await Promise.all([
      Intern.countDocuments({ 'internshipDetails.status': 'Active' }),
      LearningResource.countDocuments({ isActive: true }),
      ToolResource.countDocuments({ isActive: true }),
      Project.countDocuments({ isActive: true })
    ]);

    // 2. Fetch Recent Items to build "Recent Activity"
    // We fetch the latest 5 from each to ensure we get a good mix when sorting
    const [recentInterns, recentProjects, recentResources, recentTools] = await Promise.all([
      Intern.find({}).sort({ createdAt: -1 }).limit(5).select('personalInfo.firstName personalInfo.lastName createdAt'),
      Project.find({}).sort({ createdAt: -1 }).limit(5).select('projectName createdAt'),
      LearningResource.find({}).sort({ createdAt: -1 }).limit(5).select('title createdBy createdAt'),
      ToolResource.find({}).sort({ createdAt: -1 }).limit(5).select('toolName createdBy createdAt')
    ]);

    // 3. Normalize and Merge Activities
    const activities = [
      ...recentInterns.map(item => ({
        id: item._id,
        type: 'intern',
        description: `New intern ${item.personalInfo.firstName} ${item.personalInfo.lastName} joined`,
        timestamp: item.createdAt,
        user: 'System' 
      })),
      ...recentProjects.map(item => ({
        id: item._id,
        type: 'project',
        description: `New project "${item.projectName}" created`,
        timestamp: item.createdAt || new Date(),
        user: 'Admin' // Projects usually created by admin/manager
      })),
      ...recentResources.map(item => ({
        id: item._id,
        type: 'resource',
        description: `Added resource: ${item.title}`,
        timestamp: item.createdAt || new Date(),
        user: item.createdBy?.userName || 'User'
      })),
      ...recentTools.map(item => ({
        id: item._id,
        type: 'tool',
        description: `Added tool: ${item.toolName}`,
        timestamp: item.createdAt || new Date(),
        user: item.createdBy?.userName || 'User'
      }))
    ];

    // 4. Sort by Date Descending and Take Top 10
    const sortedActivities = activities
      .sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime())
      .slice(0, 10);

    res.status(200).json({
      success: true,
      data: {
        counts: {
          activeInterns: activeInternsCount,
          learningResources: learningResourcesCount,
          tools: toolsCount,
          projects: projectsCount
        },
        recentActivities: sortedActivities
      }
    });
  } catch (error) {
    next(error);
  }
};