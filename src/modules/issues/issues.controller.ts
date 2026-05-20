import type {
  Request,
  Response,
  NextFunction,
} from "express";
import * as issuesService from './issues.service';
import { sendSuccess, sendDataOnly } from '../../utils/response';

export const createIssue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await issuesService.createNewIssue(req.body, req.user!.id);
    return sendSuccess(res, 201, 'Issue created successfully', data);
  } catch (error) {
    next(error);
  }
};

export const getAllIssues = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await issuesService.getAllIssuesList(req.query);
    return sendDataOnly(res, 200, data);
  } catch (error) {
    next(error);
  }
};

export const getSingleIssue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await issuesService.getSingleIssueById(Number(req.params.id));
    return sendDataOnly(res, 200, data);
  } catch (error) {
    next(error);
  }
};

export const updateIssue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await issuesService.patchIssueData(Number(req.params.id), req.body, req.user);
    return sendSuccess(res, 200, 'Issue updated successfully', data);
  } catch (error) {
    next(error);
  }
};

export const deleteIssue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await issuesService.removeIssueRecord(Number(req.params.id));
    return res.status(200).json({
      success: true,
      message: 'Issue deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};