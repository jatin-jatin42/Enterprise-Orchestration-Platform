//backend/src/middleware/upload.middleware.ts
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import config from '@/config/config';

// Helper function to ensure directory exists
const ensureDirectory = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Base file filter
const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, PDFs, and documents are allowed.'));
  }
};

// Project Documents Storage
const projectDocumentsStorage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const projectId = req.params.id || 'temp';
    const uploadPath = path.join(config.uploadPath, 'projects', projectId, 'documents');
    ensureDirectory(uploadPath);
    cb(null, uploadPath);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, fileExtension)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50);
    
    cb(null, `${baseName}-${uniqueSuffix}${fileExtension}`);
  },
});

// Project Images Storage
const projectImagesStorage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const projectId = req.params.id || 'temp';
    const uploadPath = path.join(config.uploadPath, 'projects', projectId, 'images');
    ensureDirectory(uploadPath);
    cb(null, uploadPath);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `image-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// User Avatars Storage
const userAvatarsStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadPath = path.join(config.uploadPath, 'users', 'avatars');
    ensureDirectory(uploadPath);
    cb(null, uploadPath);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `avatar-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// Intern Documents Storage
const internDocumentsStorage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const internId = req.params.id || 'temp';
    const uploadPath = path.join(config.uploadPath, 'interns', internId, 'documents');
    ensureDirectory(uploadPath);
    cb(null, uploadPath);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, fileExtension)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50);
    
    cb(null, `${baseName}-${uniqueSuffix}${fileExtension}`);
  },
});

// Intern Profile Images Storage
const internProfileStorage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const internId = req.params.id || 'temp';
    const uploadPath = path.join(config.uploadPath, 'interns', internId, 'profile');
    ensureDirectory(uploadPath);
    cb(null, uploadPath);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `profile-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// Upload instances
export const projectDocumentsUpload = multer({
  storage: projectDocumentsStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter,
});

export const projectImagesUpload = multer({
  storage: projectImagesStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'));
    }
  },
});

export const userAvatarsUpload = multer({
  storage: userAvatarsStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'));
    }
  },
});

export const internDocumentsUpload = multer({
  storage: internDocumentsStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter,
});

export const internProfileUpload = multer({
  storage: internProfileStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'));
    }
  },
});

// Default upload (legacy support)
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadPath = path.join(config.uploadPath, 'temp');
    ensureDirectory(uploadPath);
    cb(null, uploadPath);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: config.maxFileSize },
  fileFilter,
});

export default upload;