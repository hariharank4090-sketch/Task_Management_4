import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UserMaster } from '../models/masters/users/users.model';


declare global {
    namespace Express {
        interface Request {
            user?: {
                id: number;
                uniqueName: string;
                name: string;
                userType: number;
                branchId: number;
                [key: string]: any;
            };
        }
    }
}

// JWT secret key (should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Password hashing salt rounds
const SALT_ROUNDS = 10;

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET) as {
            id: number;
            uniqueName: string;
            userType: number;  // Should be number
            name: string;
            branchId: number;
        };

        // Fetch user from database to ensure they still exist
        const user = await UserMaster.findOne({
            where: {
                id: decoded.id,
                isActive: 1
            },
            attributes: ['id', 'uniqueName', 'name', 'userType', 'branchId']
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found or inactive'
            });
        }

        // Attach user to request object - ensure userType is number
        req.user = {
            id: user.id,
            uniqueName: user.uniqueName,
            name: user.name,
            userType: Number(user.userType), // Convert to number
            branchId: user.branchId
        };

        next();
    } catch (error) {
        console.error('Authentication error:', error);

        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }

        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({
                success: false,
                message: 'Token expired'
            });
        }

        return res.status(401).json({
            success: false,
            message: 'Authentication failed'
        });
    }
};

/**
 * Authorization middleware
 * Checks if user has required userType/permissions
 */
export const authorize = (allowedUserTypes: number[] | number) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            // Check if user is authenticated
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            // Convert single userType to array if needed
            const requiredUserTypes = Array.isArray(allowedUserTypes)
                ? allowedUserTypes
                : [allowedUserTypes];

            // Convert req.user.userType to number (it comes as string from JWT)
            const userType = Number(req.user.userType);

            // Check if user has required userType
            if (!requiredUserTypes.includes(userType)) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. Insufficient permissions.'
                });
            }

            next();
        } catch (error) {
            console.error('Authorization error:', error);
            return res.status(500).json({
                success: false,
                message: 'Authorization check failed'
            });
        }
    };
};

/**
 * Generate JWT token for user
 */
export const generateToken = (user: any): string => {
    const payload = {
        id: user.id,
        uniqueName: user.uniqueName,
        name: user.name,
        userType: Number(user.userType),
        branchId: user.branchId
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
};

/**
 * Hash password using bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compare password with hashed password
 */
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    return await bcrypt.compare(password, hashedPassword);
};

/**
 * Login controller
 */
export const login = async (req: Request, res: Response) => {
    try {
        const { uniqueName, password } = req.body;

        // Validate input
        if (!uniqueName || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        // Find user by uniqueName (case-insensitive search)
        const user = await UserMaster.findOne({
            where: {
                uniqueName,
                isActive: 1 // Only active users can login
            }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Compare passwords
        const isValidPassword = await comparePassword(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate token
        const token = generateToken(user);

        // Get user data without password
        const userData = {
            id: user.id,
            uniqueName: user.uniqueName,
            name: user.name,
            userType: user.userType,
            branchId: user.branchId,
            isActive: user.isActive
        };

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: userData
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed'
        });
    }
};

/**
 * Register/User creation controller
 */
export const register = async (req: Request, res: Response) => {
    try {
        // Hash password before saving
        const hashedPassword = await hashPassword(req.body.password);

        // Create user
        const user = await UserMaster.create({
            ...req.body,
            password: hashedPassword,
            isActive: 1 // Active by default
        });

        // Generate token
        const token = generateToken(user);

        // Get user data without password
        const userData = {
            id: user.id,
            uniqueName: user.uniqueName,
            name: user.name,
            userType: user.userType,
            branchId: user.branchId,
            isActive: user.isActive
        };

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: userData
        });

    } catch (error: any) {
        console.error('Registration error:', error);

        // Handle duplicate uniqueName
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({
                success: false,
                message: 'Username already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Registration failed'
        });
    }
};

/**
 * Change password controller
 */
export const changePassword = async (req: Request, res: Response) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Find user with password included
        const user = await UserMaster.findOne({
            where: {
                id: req.user.id,
                isActive: 1
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify old password
        const isValidOldPassword = await comparePassword(oldPassword, user.password);

        if (!isValidOldPassword) {
            return res.status(400).json({
                success: false,
                message: 'Old password is incorrect'
            });
        }

        // Hash new password
        const hashedNewPassword = await hashPassword(newPassword);

        // Update password
        await user.update({ password: hashedNewPassword });

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to change password'
        });
    }
};

/**
 * Get current user profile
 */
export const getProfile = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const user = await UserMaster.findOne({
            where: {
                id: req.user.id,
                isActive: 1
            },
            attributes: ['id', 'uniqueName', 'name', 'userType', 'branchId', 'isActive']
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Profile retrieved successfully',
            user
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get profile'
        });
    }
};

/**
 * Middleware to allow only specific userTypes
 */
export const userTypeGuard = (...allowedUserTypes: number[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!allowedUserTypes.includes(req.user.userType)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Insufficient user type.'
            });
        }

        next();
    };
};

/**
 * Optional authentication middleware
 * Tries to authenticate but continues even if no token
 */
export const optionalAuthenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];

            try {
                const decoded = jwt.verify(token, JWT_SECRET) as any;
                const user = await UserMaster.findOne({
                    where: {
                        id: decoded.id,
                        isActive: 1
                    },
                    attributes: ['id', 'uniqueName', 'name', 'userType', 'branchId']
                });

                if (user) {
                    req.user = {
                        id: user.id,
                        uniqueName: user.uniqueName,
                        name: user.name,
                        userType: user.userType,
                        branchId: user.branchId
                    };
                }
            } catch (error) {
                // Token is invalid or expired, continue without user
                console.log('Optional auth - invalid token, proceeding without user');
            }
        }

        next();
    } catch (error) {
        console.error('Optional authentication error:', error);
        next();
    }
};

/**
 * Branch-specific middleware
 * Checks if user has access to specific branch
 */
export const branchGuard = (requiredBranchId: number) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (req.user.branchId !== requiredBranchId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Branch mismatch.'
            });
        }

        next();
    };
};