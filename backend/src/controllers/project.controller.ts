import { Request, Response } from 'express';
import Project, { IProject } from '@/models/Project.model';
import Intern, { IIntern } from '@/models/Intern.model';
import User from '@/models/User.model';
import { AuthRequest } from '@/middleware/auth.middleware';
import mongoose, { Types } from 'mongoose';
import { FileService } from '@/utils/file.service';
import path from 'path';

export const getAllProjects = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { status, search, page = '1', limit = '10' } = req.query;
    const query: any = { isActive: true };

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { projectName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { technologies: { $in: [new RegExp(search as string, 'i')] } }
      ];
    }

    const total = await Project.countDocuments(query);

    const projects = await Project.find(query)
      .populate('manager.userId', 'username profile firstName lastName')
      .populate('teamMembers.memberId', 'username profile firstName lastName personalInfo')
      .populate('createdBy', 'username profile firstName lastName')
      .populate('updatedBy', 'username profile firstName lastName')
      .populate('pdfDocuments.uploadedBy', 'username profile firstName lastName')
      .sort({ createdAt: -1 })
      .skip((parseInt(page as string) - 1) * parseInt(limit as string))
      .limit(parseInt(limit as string));

    return res.status(200).json({
      success: true,
      data: projects,
      pagination: {
        currentPage: parseInt(page as string),
        totalPages: Math.ceil(total / parseInt(limit as string)),
        totalItems: total,
        itemsPerPage: parseInt(limit as string)
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ success: false, message: 'Failed to fetch projects', error: errorMessage });
  }
};

export const getProjectById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('manager.userId', 'username profile firstName lastName')
      .populate('teamMembers.memberId', 'username profile firstName lastName personalInfo')
      .populate('createdBy', 'username profile firstName lastName')
      .populate('updatedBy', 'username profile firstName lastName')
      .populate('pdfDocuments.uploadedBy', 'username profile firstName lastName');

    if (!project || !project.isActive) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    return res.status(200).json({ success: true, data: project });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ success: false, message: 'Failed to fetch project', error: errorMessage });
  }
};

export const createProject = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const {
      projectName,
      description,
      status = 'Planning',
      startDate,
      endDate,
      projectUrl,
      repositoryUrl,
      documentationUrl,
      technologies = []
    } = req.body;

    if (!projectName) {
      return res.status(400).json({ success: false, message: 'Project name is required' });
    }

    const projectData: Partial<IProject> = {
      projectName,
      description,
      status,
      technologies,
      createdBy: req.user?._id,
      isActive: true,
      pdfDocuments: []
    };

    // Add optional fields if provided
    if (startDate) projectData.startDate = new Date(startDate);
    if (endDate) projectData.endDate = new Date(endDate);
    if (projectUrl) projectData.projectUrl = projectUrl;
    if (repositoryUrl) projectData.repositoryUrl = repositoryUrl;
    if (documentationUrl) projectData.documentationUrl = documentationUrl;

    // Set current user as manager by default
    if (req.user?._id) {
      projectData.manager = {
        userId: req.user._id,
        name: req.user.username
      };
    }

    // Create project first to get ID
    const project = new Project(projectData);
    await project.save();

    // Handle file uploads if any (move from temp to project folder)
    const files = req.files as Express.Multer.File[] | undefined;
    if (files && files.length > 0) {
      // Cast project._id to string to fix TypeScript error
      const projectId = (project._id as mongoose.Types.ObjectId).toString();
      
      for (const file of files) {
        // Ensure project documents directory exists
        FileService.ensureDirectory(FileService.getProjectDocumentsPath(projectId));

        const fileExtension = path.extname(file.originalname);
        const newFilename = `doc-${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExtension}`;
        const newPath = path.join(FileService.getProjectDocumentsPath(projectId), newFilename);
        
        // Move file from temp to project folder
        const moveSuccess = await FileService.moveFile(file.path, newPath);
        
        if (!moveSuccess) {
          console.error('Failed to move file:', file.path);
          continue;
        }

        const fileUrl = FileService.getFileUrl(newPath);
        const fileInfo = FileService.getFileInfo(newPath);

        const pdfDocument = {
          title: path.basename(file.originalname, fileExtension),
          url: fileUrl,
          uploadedAt: new Date(),
          uploadedBy: req.user?._id,
          description: `Uploaded during project creation - ${file.originalname}`,
          filename: newFilename,
          originalName: file.originalname,
          size: fileInfo?.size || 0,
        };

        project.pdfDocuments!.push(pdfDocument);
      }
      await project.save();
    }

    // Populate and return
    const populatedProject = await Project.findById(project._id)
      .populate('manager.userId', 'username profile firstName lastName')
      .populate('createdBy', 'username profile firstName lastName')
      .populate('pdfDocuments.uploadedBy', 'username profile firstName lastName');

    return res.status(201).json({
      success: true,
      message: files && files.length > 0 
        ? `Project created successfully with ${files.length} document(s)`
        : 'Project created successfully',
      data: populatedProject
    });
  } catch (error) {
    // Clean up any uploaded files if error occurs
    const files = req.files as Express.Multer.File[] | undefined;
    if (files && files.length > 0) {
      await Promise.all(files.map(file => FileService.deleteFile(file.path)));
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to create project', 
      error: errorMessage 
    });
  }
};

export const updateProject = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Update allowed fields
    const allowedFields = [
      'projectName', 'description', 'status', 'startDate', 'endDate',
      'projectUrl', 'repositoryUrl', 'documentationUrl', 'technologies'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'startDate' || field === 'endDate') {
          (project as any)[field] = req.body[field] ? new Date(req.body[field]) : null;
        } else {
          (project as any)[field] = req.body[field];
        }
      }
    });

    // Handle file uploads if any
    const files = req.files as Express.Multer.File[] | undefined;
    if (files && files.length > 0) {
      // Cast project._id to string to fix TypeScript error
      const projectId = (project._id as mongoose.Types.ObjectId).toString();
      
      for (const file of files) {
        // Ensure project documents directory exists
        FileService.ensureDirectory(FileService.getProjectDocumentsPath(projectId));

        const fileExtension = path.extname(file.originalname);
        const newFilename = `doc-${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExtension}`;
        const newPath = path.join(FileService.getProjectDocumentsPath(projectId), newFilename);
        
        // Move file from temp to project folder
        const moveSuccess = await FileService.moveFile(file.path, newPath);
        
        if (!moveSuccess) {
          console.error('Failed to move file:', file.path);
          continue;
        }

        const fileUrl = FileService.getFileUrl(newPath);
        const fileInfo = FileService.getFileInfo(newPath);

        const pdfDocument = {
          title: path.basename(file.originalname, fileExtension),
          url: fileUrl,
          uploadedAt: new Date(),
          uploadedBy: req.user?._id,
          description: `Uploaded during project update - ${file.originalname}`,
          filename: newFilename,
          originalName: file.originalname,
          size: fileInfo?.size || 0,
        };

        project.pdfDocuments = project.pdfDocuments || [];
        project.pdfDocuments.push(pdfDocument);
      }
    }

    if (req.user?._id) {
      project.updatedBy = req.user._id;
    }

    await project.save();

    // Return populated project
    const updatedProject = await Project.findById(project._id)
      .populate('manager.userId', 'username profile firstName lastName')
      .populate('teamMembers.memberId', 'username profile firstName lastName personalInfo')
      .populate('createdBy', 'username profile firstName lastName')
      .populate('updatedBy', 'username profile firstName lastName')
      .populate('pdfDocuments.uploadedBy', 'username profile firstName lastName');

    return res.status(200).json({
      success: true,
      message: files && files.length > 0 
        ? `Project updated successfully with ${files.length} new document(s)`
        : 'Project updated successfully',
      data: updatedProject
    });
  } catch (error) {
    // Delete any uploaded files if error occurs
    const files = req.files as Express.Multer.File[] | undefined;
    if (files && files.length > 0) {
      await Promise.all(files.map(file => FileService.deleteFile(file.path)));
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to update project', 
      error: errorMessage 
    });
  }
};

export const deleteProject = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Soft delete
    project.isActive = false;
    if (req.user?._id) {
      project.updatedBy = req.user._id;
    }
    await project.save();

    // Remove project from all interns' projects array
    await Intern.updateMany(
      { 'projects.projectId': project._id },
      { $pull: { projects: { projectId: project._id } } }
    );

    // Clean up project files - cast _id to string
    await cleanupProjectFiles((project._id as mongoose.Types.ObjectId).toString());

    return res.status(200).json({ 
      success: true, 
      message: 'Project deleted successfully' 
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to delete project', 
      error: errorMessage 
    });
  }
};

export const assignProjectToIntern = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { internId, role, startDate, endDate } = req.body;
    const projectId = req.params.id;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(internId)) {
      return res.status(400).json({ success: false, message: 'Invalid intern ID' });
    }

    // Find project and intern
    const project = await Project.findById(projectId);
    const intern = await Intern.findById(internId);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (!intern) {
      return res.status(404).json({ success: false, message: 'Intern not found' });
    }

    // Check if intern is already in project team members
    const existingTeamMember = project.teamMembers?.find(
      member => 
        member.memberId.toString() === internId && 
        member.memberType === 'Intern'
    );

    if (existingTeamMember) {
      return res.status(400).json({ 
        success: false, 
        message: 'Intern is already assigned to this project' 
      });
    }

    // Check if project already exists in intern's projects
    const existingProject = intern.projects?.find(
      proj => proj.projectId?.toString() === projectId
    );

    if (existingProject) {
      return res.status(400).json({ 
        success: false, 
        message: 'Project is already assigned to this intern' 
      });
    }

    // Add intern to project team members with proper typing
    const teamMember = {
      memberId: new mongoose.Types.ObjectId(internId),
      memberType: 'Intern' as const,
      name: `${intern.personalInfo.firstName} ${intern.personalInfo.lastName}`,
      role: role || 'Team Member',
      joinedAt: new Date()
    };

    project.teamMembers = [...(project.teamMembers || []), teamMember];

    // Create properly typed project object for intern - cast project._id
    const internProject: NonNullable<IIntern['projects']>[0] = {
      projectId: project._id as Types.ObjectId,
      projectName: project.projectName,
      role: role || 'Team Member',
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : undefined,
      status: (project.status === 'Planning' ? 'In Progress' : project.status) as 'In Progress' | 'Completed' | 'On Hold',
      projectUrl: project.projectUrl,
      description: project.description,
      technologies: project.technologies || []
    };

    intern.projects = [...(intern.projects || []), internProject];
    
    if (req.user?._id) {
      project.updatedBy = req.user._id;
    }

    await project.save();
    await intern.save();

    // Return updated project with populated data
    const updatedProject = await Project.findById(projectId)
      .populate('manager.userId', 'username profile firstName lastName')
      .populate('teamMembers.memberId', 'username profile firstName lastName personalInfo');

    return res.status(200).json({
      success: true,
      message: 'Project assigned to intern successfully',
      data: updatedProject
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to assign project to intern', 
      error: errorMessage 
    });
  }
};

export const removeProjectFromIntern = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { internId } = req.query;
    const projectId = req.params.id;

    if (!internId || typeof internId !== 'string') {
      return res.status(400).json({ success: false, message: 'Intern ID is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(internId)) {
      return res.status(400).json({ success: false, message: 'Invalid intern ID' });
    }

    const project = await Project.findById(projectId);
    const intern = await Intern.findById(internId);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (!intern) {
      return res.status(404).json({ success: false, message: 'Intern not found' });
    }

    // Remove intern from project team members
    const initialTeamLength = project.teamMembers?.length || 0;
    project.teamMembers = project.teamMembers?.filter(
      member => !(
        member.memberId.toString() === internId && 
        member.memberType === 'Intern'
      )
    ) || [];

    // Remove project from intern's projects array
    const initialProjectsLength = intern.projects?.length || 0;
    intern.projects = intern.projects?.filter(
      proj => proj.projectId?.toString() !== projectId
    ) || [];

    // Check if any changes were made
    if (project.teamMembers.length === initialTeamLength && 
        intern.projects.length === initialProjectsLength) {
      return res.status(400).json({ 
        success: false, 
        message: 'Intern was not assigned to this project' 
      });
    }

    if (req.user?._id) {
      project.updatedBy = req.user._id;
    }
    
    await project.save();
    await intern.save();

    // Return updated project
    const updatedProject = await Project.findById(projectId)
      .populate('manager.userId', 'username profile firstName lastName')
      .populate('teamMembers.memberId', 'username profile firstName lastName personalInfo');

    return res.status(200).json({
      success: true,
      message: 'Intern removed from project successfully',
      data: updatedProject
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to remove intern from project', 
      error: errorMessage 
    });
  }
};

export const getProjectInterns = async (req: Request, res: Response): Promise<Response> => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Get all intern team members
    const internMembers = project.teamMembers?.filter(
      member => member.memberType === 'Intern'
    ) || [];
    
    if (internMembers.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: 'No interns assigned to this project'
      });
    }

    const internIds = internMembers.map(member => member.memberId);
    const interns = await Intern.find({ _id: { $in: internIds } });

    // Combine intern data with their role in the project
    const projectInterns = interns.map(intern => {
      const teamMember = internMembers.find(
        member => member.memberId.toString() === (intern._id as mongoose.Types.ObjectId).toString()
      );
      return {
        intern: {
          _id: intern._id,
          personalInfo: intern.personalInfo,
          internshipDetails: intern.internshipDetails
        },
        role: teamMember?.role,
        joinedAt: teamMember?.joinedAt,
        memberId: teamMember?.memberId
      };
    });

    return res.status(200).json({
      success: true,
      data: projectInterns
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch project interns', 
      error: errorMessage 
    });
  }
};

export const updateProjectManager = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { userId, name } = req.body;
    const projectId = req.params.id;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    project.manager = {
      userId: new mongoose.Types.ObjectId(userId),
      name: name || user.username
    };

    if (req.user?._id) {
      project.updatedBy = req.user._id;
    }
    
    await project.save();

    // Return updated project
    const updatedProject = await Project.findById(projectId)
      .populate('manager.userId', 'username profile firstName lastName')
      .populate('teamMembers.memberId', 'username profile firstName lastName personalInfo');

    return res.status(200).json({
      success: true,
      message: 'Project manager updated successfully',
      data: updatedProject
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to update project manager', 
      error: errorMessage 
    });
  }
};

export const addPdfDocument = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const projectId = req.params.id as string;
    const { title, description } = req.body;

    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'PDF file is required' 
      });
    }

    if (!title) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title is required for PDF document' 
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      // Delete the uploaded file if project not found
      await FileService.deleteFile(req.file.path);
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Ensure project documents directory exists
    FileService.ensureDirectory(FileService.getProjectDocumentsPath(projectId));

    const fileExtension = path.extname(req.file.originalname);
    const newFilename = `doc-${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExtension}`;
    const newPath = path.join(FileService.getProjectDocumentsPath(projectId), newFilename);
    
    // Move file from temp to project folder
    const moveSuccess = await FileService.moveFile(req.file.path, newPath);
    
    if (!moveSuccess) {
      await FileService.deleteFile(req.file.path);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to save document' 
      });
    }

    const fileUrl = FileService.getFileUrl(newPath);
    const fileInfo = FileService.getFileInfo(newPath);

    const pdfDocument = {
      title,
      url: fileUrl,
      uploadedAt: new Date(),
      uploadedBy: req.user?._id,
      description: description || '',
      filename: newFilename,
      originalName: req.file.originalname,
      size: fileInfo?.size || 0,
    };

    project.pdfDocuments = [...(project.pdfDocuments || []), pdfDocument];
    
    if (req.user?._id) {
      project.updatedBy = req.user._id;
    }
    
    await project.save();

    // Return updated project with populated PDF documents
    const updatedProject = await Project.findById(projectId)
      .populate('pdfDocuments.uploadedBy', 'username profile firstName lastName')
      .populate('updatedBy', 'username profile firstName lastName');

    return res.status(200).json({
      success: true,
      message: 'PDF document added successfully',
      data: updatedProject
    });
  } catch (error) {
    // Delete the uploaded file if error occurs
    if (req.file) {
      await FileService.deleteFile(req.file.path);
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to add PDF document', 
      error: errorMessage 
    });
  }
};

export const removePdfDocument = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { documentIndex } = req.params;
    const projectId = req.params.id;

    const index = parseInt(documentIndex as string);
    if (isNaN(index) || index < 0) {
      return res.status(400).json({ success: false, message: 'Invalid document index' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (!project.pdfDocuments || index >= project.pdfDocuments.length) {
      return res.status(404).json({ success: false, message: 'PDF document not found' });
    }

    const documentToRemove = project.pdfDocuments[index];
    
    // Delete the physical file
    if (documentToRemove.url) {
      const absolutePath = FileService.getAbsolutePathFromUrl(documentToRemove.url);
      await FileService.deleteFile(absolutePath);
    }

    // Remove from array
    project.pdfDocuments.splice(index, 1);
    
    if (req.user?._id) {
      project.updatedBy = req.user._id;
    }
    
    await project.save();

    return res.status(200).json({
      success: true,
      message: 'PDF document removed successfully'
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to remove PDF document', 
      error: errorMessage 
    });
  }
};

export const getProjectDocuments = async (req: Request, res: Response): Promise<Response> => {
  try {
    const projectId = req.params.id;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    return res.status(200).json({
      success: true,
      data: project.pdfDocuments || []
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch project documents', 
      error: errorMessage 
    });
  }
};

// Clean up project files when project is deleted
export const cleanupProjectFiles = async (projectId: string): Promise<boolean> => {
  try {
    const projectPath = path.join(FileService.getProjectDocumentsPath(projectId), '..');
    return await FileService.deleteFolder(projectPath);
  } catch (error) {
    console.error('Error cleaning up project files:', error);
    return false;
  }
};