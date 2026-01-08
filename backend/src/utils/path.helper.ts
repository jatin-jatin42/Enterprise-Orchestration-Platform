import path from 'path';
import { config } from '@/config/config';

export class PathHelper {
  /**
   * Get the absolute path for project documents
   */
  static getProjectDocumentsPath(projectId: string): string {
    return path.join(
      config.uploadPath, 
      config.uploadFolders.projects, 
      projectId, 
      'documents'
    );
  }

  /**
   * Get the absolute path for project images
   */
  static getProjectImagesPath(projectId: string): string {
    return path.join(
      config.uploadPath, 
      config.uploadFolders.projects, 
      projectId, 
      'images'
    );
  }

  /**
   * Get the absolute path for user avatars
   */
  static getUserAvatarsPath(): string {
    return path.join(
      config.uploadPath, 
      config.uploadFolders.users, 
      'avatars'
    );
  }

  /**
   * Get the absolute path for intern documents
   */
  static getInternDocumentsPath(internId: string): string {
    return path.join(
      config.uploadPath, 
      config.uploadFolders.interns, 
      internId, 
      'documents'
    );
  }

  /**
   * Get the URL path for accessing uploaded files
   */
  static getFileUrl(absolutePath: string): string {
    const relativePath = path.relative(config.uploadPath, absolutePath);
    return `/uploads/${relativePath.replace(/\\/g, '/')}`;
  }

  /**
   * Get the absolute path from a URL
   */
  static getAbsolutePathFromUrl(url: string): string {
    const relativePath = url.replace('/uploads/', '');
    return path.join(config.uploadPath, relativePath);
  }

  /**
   * Validate if a path is within the uploads directory (security)
   */
  static isPathSafe(filePath: string): boolean {
    const relative = path.relative(config.uploadPath, filePath);
    return !relative.startsWith('..') && !path.isAbsolute(relative);
  }

  /**
   * Get file extension from filename
   */
  static getFileExtension(filename: string): string {
    return path.extname(filename).toLowerCase();
  }

  /**
   * Generate a safe filename
   */
  static generateSafeFilename(originalName: string, uniqueSuffix: string): string {
    const extension = this.getFileExtension(originalName);
    const baseName = path.basename(originalName, extension)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50);
    
    return `${baseName}-${uniqueSuffix}${extension}`;
  }
}

export default PathHelper;