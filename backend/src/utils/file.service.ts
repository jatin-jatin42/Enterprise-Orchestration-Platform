import fs from 'fs';
import path from 'path';
import { config } from '@/config/config';

export interface FileInfo {
  originalName: string;
  filename: string;
  path: string;
  size: number;
  mimetype: string;
  uploadDate: Date;
}

export class FileService {
  /**
   * Get file URL for frontend access
   */
  static getFileUrl(filepath: string): string {
    const relativePath = path.relative(config.uploadPath, filepath);
    return `/uploads/${relativePath.replace(/\\/g, '/')}`;
  }

  /**
   * Get absolute file path from relative path
   */
  static getAbsolutePath(relativePath: string): string {
    return path.join(config.uploadPath, relativePath);
  }

  /**
   * Get absolute path from URL
   */
  static getAbsolutePathFromUrl(url: string): string {
    const relativePath = url.replace('/uploads/', '');
    return path.join(config.uploadPath, relativePath);
  }

  /**
   * Delete file from filesystem
   */
  static async deleteFile(filepath: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (fs.existsSync(filepath)) {
        fs.unlink(filepath, (err) => {
          if (err) {
            console.error('Error deleting file:', err);
            resolve(false);
          } else {
            resolve(true);
          }
        });
      } else {
        resolve(true); // File doesn't exist, consider it deleted
      }
    });
  }

  /**
   * Delete entire folder recursively
   */
  static async deleteFolder(folderPath: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (fs.existsSync(folderPath)) {
        fs.rm(folderPath, { recursive: true }, (err) => {
          if (err) {
            console.error('Error deleting folder:', err);
            resolve(false);
          } else {
            resolve(true);
          }
        });
      } else {
        resolve(true);
      }
    });
  }

  /**
   * Get file information
   */
  static getFileInfo(filepath: string): FileInfo | null {
    try {
      const stats = fs.statSync(filepath);
      return {
        originalName: path.basename(filepath),
        filename: path.basename(filepath),
        path: filepath,
        size: stats.size,
        mimetype: this.getMimeType(path.extname(filepath)),
        uploadDate: stats.mtime,
      };
    } catch (error) {
      console.error('Error getting file info:', error);
      return null;
    }
  }

  /**
   * List files in a directory
   */
  static listFiles(directory: string): FileInfo[] {
    try {
      if (!fs.existsSync(directory)) {
        return [];
      }

      const files = fs.readdirSync(directory);
      return files
        .map(filename => {
          const filepath = path.join(directory, filename);
          try {
            const stats = fs.statSync(filepath);
            
            if (stats.isFile()) {
              return {
                originalName: filename,
                filename: filename,
                path: filepath,
                size: stats.size,
                mimetype: this.getMimeType(path.extname(filename)),
                uploadDate: stats.mtime,
              };
            }
            return null;
          } catch (error) {
            console.error(`Error reading file ${filename}:`, error);
            return null;
          }
        })
        .filter((file): file is FileInfo => file !== null);
    } catch (error) {
      console.error('Error listing files:', error);
      return [];
    }
  }

  /**
   * Get MIME type from file extension
   */
  private static getMimeType(extension: string): string {
    const mimeTypes: { [key: string]: string } = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain',
    };

    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
  }

  /**
   * Create directory if it doesn't exist
   */
  static ensureDirectory(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  /**
   * Get project documents directory
   */
  static getProjectDocumentsPath(projectId: string): string {
    return path.join(config.uploadPath, 'projects', projectId, 'documents');
  }

  /**
   * Get project images directory
   */
  static getProjectImagesPath(projectId: string): string {
    return path.join(config.uploadPath, 'projects', projectId, 'images');
  }

  /**
   * Get user avatars directory
   */
  static getUserAvatarsPath(): string {
    return path.join(config.uploadPath, 'users', 'avatars');
  }

  /**
   * Get intern documents directory
   */
  static getInternDocumentsPath(internId: string): string {
    return path.join(config.uploadPath, 'interns', internId, 'documents');
  }

  /**
   * Get intern profile images directory
   */
  static getInternProfilePath(internId: string): string {
    return path.join(config.uploadPath, 'interns', internId, 'profile');
  }

  /**
   * Check if file exists
   */
  static fileExists(filepath: string): boolean {
    return fs.existsSync(filepath);
  }

  /**
   * Get file size in human readable format
   */
  static getFileSizeReadable(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Validate file type and size
   */
  static validateFile(file: Express.Multer.File, allowedMimeTypes: string[], maxSize: number): boolean {
    if (file.size > maxSize) {
      return false;
    }
    
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return false;
    }
    
    return true;
  }

  /**
   * Clean up temporary files for a project
   */
  static async cleanupProjectTempFiles(projectId: string): Promise<boolean> {
    const tempPath = path.join(config.uploadPath, 'projects', 'temp');
    try {
      const files = this.listFiles(tempPath);
      const projectFiles = files.filter(file => 
        file.filename.includes(projectId) || 
        file.path.includes(projectId)
      );
      
      await Promise.all(projectFiles.map(file => this.deleteFile(file.path)));
      return true;
    } catch (error) {
      console.error('Error cleaning up temp files:', error);
      return false;
    }
  }

  /**
   * Move file from temp to permanent location
   */
  static async moveFile(oldPath: string, newPath: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.ensureDirectory(path.dirname(newPath));
      fs.rename(oldPath, newPath, (err) => {
        if (err) {
          console.error('Error moving file:', err);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }
}

export default FileService;