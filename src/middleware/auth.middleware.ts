import type {
  Request,
  Response,
  NextFunction,
} from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/apperror";


export interface TJwtPayload {
  id: number;
  name: string;
  role: "contributor" | "maintainer";
}


declare global {
  namespace Express {
    interface Request {
      user?: TJwtPayload;
    }
  }
}


export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

 
  if (!authHeader) {
    return next(new AppError(401, "Unauthorized: Missing token"));
  }

 
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("Internal Server Error: JWT_SECRET is not defined");
    }

   
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

   
    req.user = (decoded as unknown) as TJwtPayload;

    next();
  } catch (error) {
   
    next(new AppError(401, "Unauthorized: Invalid or expired token"));
  }
};


export const authorize = (...allowedRoles: TJwtPayload["role"][]) => {
  return (req: Request, res: Response, next: NextFunction) => {
  
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new AppError(403, "Forbidden: Insufficient permissions"));
    }

    next();
  };
};