import { Request, Response, NextFunction } from "express";
export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        isAdmin: boolean;
    };
}
/**
 * Middleware to authenticate JWT token from Authorization header
 */
export declare const authenticateToken: (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
/**
 * Middleware to check if authenticated user is an admin
 */
export declare const requireAdmin: (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
/**
 * Middleware to check if user can access their own resource or is admin
 */
export declare const requireOwnerOrAdmin: (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=auth.d.ts.map