import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';

interface ApiResponse<T = any> {
  status: 'success' | 'error';
  statusCode: number;
  message?: string;
  data?: T;
  errors?: any;
  timestamp: string;
}

class ResponseHandler {
  private static buildResponse<T>(
    status: 'success' | 'error',
    statusCode: number,
    message?: string,
    data?: T,
    errors?: any
  ): ApiResponse<T> {
    const response: ApiResponse<T> = {
      status,
      statusCode,
      timestamp: new Date().toISOString(),
    };

    if (message) response.message = message;
    if (data !== undefined) response.data = data;
    if (errors) response.errors = errors;

    return response;
  }

  static success<T = any>(
    res: Response,
    data?: T,
    message?: string,
    statusCode: number = StatusCodes.OK
  ): void {
    const response = this.buildResponse('success', statusCode, message, data);
    res.status(statusCode).json(response);
  }

  static created<T = any>(res: Response, data?: T, message?: string): void {
    this.success(res, data, message, StatusCodes.CREATED);
  }

  static error(
    res: Response,
    message: string,
    statusCode: number = StatusCodes.BAD_REQUEST,
    errors?: any
  ): void {
    const response = this.buildResponse('error', statusCode, message, undefined, errors);
    res.status(statusCode).json(response);
  }

  static unauthorized(res: Response, message: string = 'Unauthorized'): void {
    this.error(res, message, StatusCodes.UNAUTHORIZED);
  }

  static forbidden(res: Response, message: string = 'Forbidden'): void {
    this.error(res, message, StatusCodes.FORBIDDEN);
  }

  static notFound(res: Response, message: string = 'Resource not found'): void {
    this.error(res, message, StatusCodes.NOT_FOUND);
  }

  static badRequest(res: Response, message: string, errors?: any): void {
    this.error(res, message, StatusCodes.BAD_REQUEST, errors);
  }

  static internalError(res: Response, message: string = 'Internal server error'): void {
    this.error(res, message, StatusCodes.INTERNAL_SERVER_ERROR);
  }

  static noContent(res: Response): void {
    res.status(StatusCodes.NO_CONTENT).send();
  }
}

export default ResponseHandler;
