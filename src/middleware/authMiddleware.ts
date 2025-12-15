import { Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthenticatedRequest, JwtPayload } from '../types';

/**
 * Middleware to verify JWT token and attach user info to request
 */
// export const verifyToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
//   try {
//     // Get token from Authorization header
//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       res.status(401).json({
//         success: false,
//         message: 'No token provided. Authorization denied.',
//       });
//       return;
//     }

//     const token = authHeader.split(' ')[1];

//     // Verify token
//     const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

//     // Attach user info to request
//     req.user = decoded;

//     next();
//   } catch (error) {
//     if (error instanceof jwt.TokenExpiredError) {
//       res.status(401).json({
//         success: false,
//         message: 'Token expired. Please login again.',
//       });
//       return;
//     }

//     if (error instanceof jwt.JsonWebTokenError) {
//       res.status(401).json({
//         success: false,
//         message: 'Invalid token. Authorization denied.',
//       });
//       return;
//     }

//     res.status(500).json({
//       success: false,
//       message: 'Server error during authentication.',
//     });
//   }
// };

export const verifyToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    if (req.method === 'OPTIONS') {
      return next();
    }

    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'No token provided. Authorization denied.',
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    // Attach user info to request
    req.user = decoded;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.',
      });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'Invalid token. Authorization denied.',
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Server error during authentication.',
    });
  }
};

/**
 * Generate JWT access token
 */
export const generateAccessToken = (userId: string, role: string): string => {
  return jwt.sign({ userId, role }, env.JWT_SECRET, {
    expiresIn: env.ACCESS_TOKEN_EXPIRES_IN,
  } as SignOptions);
};

/**
 * Generate JWT refresh token
 */
export const generateRefreshToken = (userId: string, role: string): string => {
  return jwt.sign({ userId, role }, env.JWT_SECRET, {
    expiresIn: env.REFRESH_TOKEN_EXPIRES_IN,
  } as SignOptions);
};
