import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ERROR_MESSAGES } from '../constants/messages';

interface CustomError extends Error {
  statusCode?: number;
}

export const notFound = (req: Request, _res: Response, next: NextFunction): void => {
  const error: CustomError = new Error(`${ERROR_MESSAGES.NOT_FOUND} - ${req.originalUrl}`);
  error.statusCode = StatusCodes.NOT_FOUND;
  next(error);
};

export const errorHandler = (
  err: CustomError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;

  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};
