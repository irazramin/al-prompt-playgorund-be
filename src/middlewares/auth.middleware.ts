import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import passport from 'passport';
import { IUser } from '../models/user.model';
import { AUTH_MESSAGES } from '../constants/messages';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface User extends IUser {}
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  passport.authenticate('jwt', { session: false }, (err: any, user: IUser, info: any) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: info?.message || AUTH_MESSAGES.AUTHENTICATION_REQUIRED,
      });
      return;
    }

    req.user = user;
    next();
  })(req, res, next);
};

export const authenticateLocal = (req: Request, res: Response, next: NextFunction): void => {
  passport.authenticate('local', { session: false }, (err: any, user: IUser, info: any) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: info?.message || AUTH_MESSAGES.INVALID_CREDENTIALS,
      });
      return;
    }

    req.user = user;
    next();
  })(req, res, next);
};
