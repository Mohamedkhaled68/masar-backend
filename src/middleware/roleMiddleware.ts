import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, UserRole } from '../types.js';

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

export const isAdmin = requireRole('admin');

export const isTeacher = requireRole('teacher');

export const isSchool = requireRole('school');

export const isTeacherOrSchool = requireRole('teacher', 'school');
