import express from "express";

import type {
  Request,
  Response,
  NextFunction,
} from "express";
import { AppError } from '../utils/apperror';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err.message || 'Internal Server Error';
  const errors = err instanceof AppError ? err.errors : null;

  res.status(statusCode).json({
  success: false,
  message,
  errors: errors 
});
};