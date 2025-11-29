import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { AUTH_MESSAGES } from '../constants/messages';
import ResponseHandler from '../helpers/response.helper';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return ResponseHandler.badRequest(res, AUTH_MESSAGES.EMAIL_PASSWORD_REQUIRED);
    }

    const user = await authService.register(email, password, name);

    // Don't send password in response
    const { password: _, ...userWithoutPassword } = user;

    ResponseHandler.created(res, userWithoutPassword, AUTH_MESSAGES.REGISTER_SUCCESS);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // User is already authenticated by Passport local strategy
    if (!req.user) {
      return ResponseHandler.unauthorized(res, AUTH_MESSAGES.AUTHENTICATION_FAILED);
    }

    const tokens = await authService.generateTokens(req.user._id.toString(), req.user.email);

    // Don't send password in response
    const { password: _, ...userWithoutPassword } = req.user.toObject();

    // Set cookies
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000,
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    ResponseHandler.success(res, { user: userWithoutPassword, tokens }, AUTH_MESSAGES.LOGIN_SUCCESS);
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get refresh token from body or cookie
    const refreshToken = req.body.refreshToken || req.cookies.refreshToken;

    if (!refreshToken) {
      return ResponseHandler.badRequest(res, AUTH_MESSAGES.REFRESH_TOKEN_REQUIRED);
    }

    const tokens = await authService.refreshToken(refreshToken);

    // Update cookies with new tokens
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    ResponseHandler.success(res, tokens, AUTH_MESSAGES.TOKEN_REFRESHED);
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      return ResponseHandler.unauthorized(res, AUTH_MESSAGES.UNAUTHORIZED);
    }

    await authService.logout(req.user._id.toString());

    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    ResponseHandler.success(res, undefined, AUTH_MESSAGES.LOGOUT_SUCCESS);
  } catch (error) {
    next(error);
  }
};
