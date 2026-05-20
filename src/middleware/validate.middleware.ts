import express from "express";

import type {
  Request,
  Response,
  NextFunction,
} from "express";
import { AppError } from '../utils/apperror';

export const validateSignup = (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return next(new AppError(400, 'Bad Request: name, email, and password are required'));
  }
  if (role && role !== 'contributor' && role !== 'maintainer') {
    return next(new AppError(400, 'Bad Request: role must be contributor or maintainer'));
  }
  next();
};

export const validateIssue = (req: Request, res: Response, next: NextFunction) => {
  const { title, description, type } = req.body;
  if (!title || !description || !type) {
    return next(new AppError(400, 'Bad Request: title, description, and type are required'));
  }
  if (title.length > 150) {
    return next(new AppError(400, 'Bad Request: title cannot exceed 150 characters'));
  }
  if (description.length < 20) {
    return next(new AppError(400, 'Bad Request: description must be at least 20 characters'));
  }
  if (type !== 'bug' && type !== 'feature_request') {
    return next(new AppError(400, 'Bad Request: type must be bug or feature_request'));
  }
  next();
};