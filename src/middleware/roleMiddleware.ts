import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, UserRole } from '../types';

/**
 * Middleware to check if user has required role(s)
 * @param roles - Single role or array of roles allowed to access the route
 */
export const requireRole = (...roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`,
      });
      return;
    }

    next();
  };
};

/**
 * Convenience middleware for admin-only routes
 */
export const isAdmin = requireRole('admin');

/**
 * Convenience middleware for teacher-only routes
 */
export const isTeacher = requireRole('teacher');

/**
 * Convenience middleware for school-only routes
 */
export const isSchool = requireRole('school');

/**
 * Middleware for routes accessible by teachers or schools
 */
export const isTeacherOrSchool = requireRole('teacher', 'school');
