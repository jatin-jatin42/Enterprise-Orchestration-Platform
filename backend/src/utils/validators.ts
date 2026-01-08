//backend/src/utils/validators.ts

import { body, ValidationChain, validationResult } from 'express-validator';
import { RequestHandler } from 'express';

/**
 * Middleware to handle validation errors
 */
export const validateRequest: RequestHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  return next();
};

/**
 * Validation rules for user registration
 */
export const registrationValidation: (ValidationChain | RequestHandler)[] = [
  body('username')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must contain only letters, numbers, and underscores'),
  body('email').isEmail().withMessage('Must be a valid email').normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/)
    .withMessage('Password must include uppercase, lowercase, and number'),
  validateRequest
];

/**
 * Validate login request
 */
export const loginValidation: (ValidationChain | RequestHandler)[] = [
  body('email').notEmpty().withMessage('Email or username is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validateRequest
];

/**
 * Validate Learning Resource creation/update
 */
export const learningResourceValidation: (ValidationChain | RequestHandler)[] = [
  body('title').notEmpty().withMessage('Title is required'),
  body('category').isIn(['Tutorial', 'Article', 'Video', 'Course', 'Documentation']),
  body('url').isURL().withMessage('Must be a valid URL'),
  validateRequest
];

/**
 * Validate Tool Resource creation/update
 */
export const toolResourceValidation: (ValidationChain | RequestHandler)[] = [
  body('toolName').notEmpty().withMessage('Tool name is required'),
  body('category').isIn(['DevOps', 'Frontend', 'Backend', 'Database', 'Design', 'Testing']),
  body('officialUrl').isURL().withMessage('Must be a valid URL'),
  validateRequest
];

/**
 * Validate Intern creation/update
 */
export const internValidation: (ValidationChain | RequestHandler)[] = [
  body('personalInfo.firstName').notEmpty().withMessage('First name is required'),
  body('personalInfo.lastName').notEmpty().withMessage('Last name is required'),
  body('personalInfo.email').isEmail().withMessage('Must be a valid email'),
  body('internshipDetails.startDate').isISO8601().toDate().withMessage('Start date must be valid date'),
  validateRequest
];

/**
 * Validate User creation (Admin only)
 */
export const userCreationValidation: (ValidationChain | RequestHandler)[] = [
  body('username')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must contain only letters, numbers, and underscores'),
  body('email').isEmail().withMessage('Must be a valid email').normalizeEmail(),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/)
    .withMessage('Password must include uppercase, lowercase, and number'),
  body('role').optional().isIn(['admin', 'user']).withMessage('Role must be admin or user'),
  validateRequest
];


/**
 * Parse form data for project validation
 */
export const parseProjectFormData: RequestHandler = (req, _res, next) => {
  // If technologies is a string, parse it as JSON
  if (req.body.technologies && typeof req.body.technologies === 'string') {
    try {
      req.body.technologies = JSON.parse(req.body.technologies);
    } catch (error) {
      req.body.technologies = [req.body.technologies];
    }
  }
  
  // Ensure technologies is an array
  if (req.body.technologies && !Array.isArray(req.body.technologies)) {
    req.body.technologies = [req.body.technologies];
  }
  
  next();
};

/**
 * Validate Project creation/update with form data support
 */
export const projectValidation: (ValidationChain | RequestHandler)[] = [
  parseProjectFormData,
  body('projectName')
    .notEmpty()
    .withMessage('Project name is required')
    .isLength({ min: 3 })
    .withMessage('Project name must be at least 3 characters long'),
  validateRequest
];