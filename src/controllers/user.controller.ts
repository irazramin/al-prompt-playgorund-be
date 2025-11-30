import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/user.service';
import { USER_MESSAGES, AUTH_MESSAGES } from '../constants/messages';
import ResponseHandler from '../helpers/response.helper';

export const getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      return ResponseHandler.unauthorized(res, AUTH_MESSAGES.UNAUTHORIZED);
    }

    const user = await userService.getUserById(req.user._id.toString());

    // Don't send password in response
    const { password: _, ...userWithoutPassword } = user;

    ResponseHandler.success(res, userWithoutPassword);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      return ResponseHandler.unauthorized(res, AUTH_MESSAGES.UNAUTHORIZED);
    }

    const { name, email } = req.body;

    if (!name && !email) {
      return ResponseHandler.badRequest(res, USER_MESSAGES.NAME_EMAIL_REQUIRED);
    }

    const updatedUser = await userService.updateProfile(req.user._id.toString(), { name, email });

    // Don't send password in response
    const { password: _, ...userWithoutPassword } = updatedUser;

    ResponseHandler.success(res, userWithoutPassword, USER_MESSAGES.PROFILE_UPDATED);
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      return ResponseHandler.unauthorized(res, AUTH_MESSAGES.UNAUTHORIZED);
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return ResponseHandler.badRequest(res, USER_MESSAGES.PASSWORD_FIELDS_REQUIRED);
    }

    if (newPassword.length < 6) {
      return ResponseHandler.badRequest(res, USER_MESSAGES.PASSWORD_MIN_LENGTH);
    }

    await userService.changePassword(req.user._id.toString(), currentPassword, newPassword);

    ResponseHandler.success(res, undefined, USER_MESSAGES.PASSWORD_CHANGED);
  } catch (error) {
    next(error);
  }
};
