import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET!;

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
export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: "Token d'authentification requis" });
  }

  try {
    const decoded = jwt.verify(token, SECRET) as {
      id: string;
      email: string;
      isAdmin: boolean;
    };
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Token invalide ou expiré" });
  }
};

/**
 * Middleware to check if authenticated user is an admin
 */
export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentification requise" });
  }

  if (!req.user.isAdmin) {
    return res.status(403).json({ error: "Accès administrateur requis" });
  }

  next();
};

/**
 * Middleware to check if user can access their own resource or is admin
 */
export const requireOwnerOrAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentification requise" });
  }

  const resourceUserId = req.params.id || req.body.id;
  
  if (req.user.isAdmin || req.user.id === resourceUserId) {
    next();
  } else {
    return res.status(403).json({ error: "Accès non autorisé" });
  }
};
