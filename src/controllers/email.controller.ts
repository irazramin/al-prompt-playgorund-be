import { Request, Response, NextFunction } from 'express';
import * as emailVerificationService from '../services/email-verification.service';
import { AUTH_MESSAGES } from '../constants/messages';
import ResponseHandler from '../helpers/response.helper';

export const verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return ResponseHandler.badRequest(res, AUTH_MESSAGES.VERIFICATION_TOKEN_REQUIRED);
    }

    await emailVerificationService.verifyEmail(token);

    ResponseHandler.success(res, undefined, AUTH_MESSAGES.EMAIL_VERIFIED);
  } catch (error) {
    next(error);
  }
};

export const resendVerification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      return ResponseHandler.badRequest(res, AUTH_MESSAGES.EMAIL_REQUIRED);
    }

    await emailVerificationService.resendVerificationEmail(email);

    ResponseHandler.success(res, undefined, 'Verification email sent successfully');
  } catch (error) {
    next(error);
  }
};
