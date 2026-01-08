//backend/src/middleware/error.middleware.ts
import { Request, Response } from 'express';

interface AppError extends Error {
  statusCode?: number;
  stack?: string;
}

// Type guard to check if error is AppError
function isAppError(error: unknown): error is AppError {
  return error instanceof Error && 'statusCode' in error;
}

export const errorHandler = (
  err: unknown, 
  req: Request, 
  res: Response, 
  // next: NextFunction
) => {
  // Log error details with more context
  console.error('🚨 Error Handler Triggered:', {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    error: err instanceof Error ? {
      name: err.name,
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    } : { unknownError: err }
  });

  // Default error response
  let statusCode = 500;
  let message = 'Internal Server Error';
  let stack: string | undefined;

  // Handle different error types
  if (isAppError(err)) {
    statusCode = err.statusCode || 500;
    message = err.message || 'Internal Server Error';
    stack = process.env.NODE_ENV === 'development' ? err.stack : undefined;
  } else if (err instanceof Error) {
    message = err.message || 'Internal Server Error';
    stack = process.env.NODE_ENV === 'development' ? err.stack : undefined;
    
    // Handle common error types
    if (err.name === 'ValidationError') statusCode = 400;
    if (err.name === 'UnauthorizedError') statusCode = 401;
    if (err.name === 'ForbiddenError') statusCode = 403;
    if (err.name === 'NotFoundError') statusCode = 404;
  } else {
    // Handle unknown error types
    message = 'An unexpected error occurred';
    stack = process.env.NODE_ENV === 'development' ? String(err) : undefined;
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack }),
    ...(process.env.NODE_ENV === 'development' && { 
      timestamp: new Date().toISOString(),
      path: req.url 
    })
  });
};