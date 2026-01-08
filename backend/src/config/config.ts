
//backend/src/config/config.ts
import dotenv from 'dotenv';
import path from 'path';
dotenv.config();

// Validate required environment variables in production
if (process.env.NODE_ENV === 'production') {
  const requiredVars = ['JWT_SECRET', 'MONGODB_URI'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
    process.exit(1);
  }
}

// Validate JWT_SECRET strength
if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
  console.warn('⚠️  WARNING: JWT_SECRET should be at least 32 characters long for security');
}

// Validate rate limit values
const rateLimitWindowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 900000;
const rateLimitMaxRequests = Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100;

if (rateLimitWindowMs <= 0 || rateLimitMaxRequests <= 0) {
  console.error('❌ Rate limit values must be positive numbers');
  process.exit(1);
}

// File upload configuration
const maxFileSize = Number(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10MB default
const uploadPath = process.env.UPLOAD_PATH || path.join(process.cwd(), 'uploads');

// Validate file size limits
if (maxFileSize <= 0) {
  console.error('❌ MAX_FILE_SIZE must be a positive number');
  process.exit(1);
}

// Define allowed file types first
const allowedImages = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const allowedDocuments = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain'
];
const allAllowedTypes = [...allowedImages, ...allowedDocuments];

export const config = {
  // Server Configuration
  port: Number(process.env.PORT) || 8000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/admin_dashboard',
  
  // Authentication
  jwtSecret: process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'change_me_securely_dev_only'),
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  
  // Security
  allowedOrigins: process.env.ALLOWED_ORIGINS ? 
    process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()) : 
    ['http://localhost:3000', 'http://localhost:5173'],
  
  // Rate Limiting
  rateLimitWindowMs,
  rateLimitMaxRequests,
  
  // File Upload Configuration
  maxFileSize,
  uploadPath,
  
  // File Type Configuration
  allowedFileTypes: {
    images: allowedImages,
    documents: allowedDocuments,
    all: allAllowedTypes
  },
  
  // File Size Limits (in bytes)
  fileSizeLimits: {
    avatar: 2 * 1024 * 1024, // 2MB
    projectImage: 5 * 1024 * 1024, // 5MB
    projectDocument: 10 * 1024 * 1024, // 10MB
    internDocument: 10 * 1024 * 1024, // 10MB
    general: maxFileSize
  },
  
  // Upload Folder Structure
  uploadFolders: {
    projects: 'projects',
    users: 'users',
    interns: 'interns',
    general: 'general'
  },
  
  // Default Admin User
  defaultAdmin: {
    email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@company.com',
    password: process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123',
    username: process.env.DEFAULT_ADMIN_USERNAME || 'admin'
  },
  
  // Project Configuration
  project: {
    defaultStatus: 'Planning' as const,
    allowedStatuses: ['Planning', 'In Progress', 'Completed', 'On Hold'] as const,
    maxTeamMembers: 50,
    maxDocumentsPerProject: 100
  },
  
  // Intern Configuration
  intern: {
    defaultStatus: 'Active' as const,
    allowedStatuses: ['Active', 'Completed', 'On Leave', 'Terminated'] as const,
    maxProjectsPerIntern: 10
  }
} as const;

// Validation for upload path
if (config.uploadPath.includes('..')) {
  console.error('❌ UPLOAD_PATH cannot contain parent directory references (..)');
  process.exit(1);
}

// Log configuration in development
if (config.nodeEnv === 'development') {
  console.log('🔧 Configuration loaded:');
  console.log(`   - Environment: ${config.nodeEnv}`);
  console.log(`   - Upload Path: ${config.uploadPath}`);
  console.log(`   - Max File Size: ${config.maxFileSize / 1024 / 1024}MB`);
  console.log(`   - Allowed Origins: ${config.allowedOrigins.join(', ')}`);
}

export default config;