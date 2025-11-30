import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { StatusCodes } from 'http-status-codes';
import User from '../models/user.model';
import RefreshToken from '../models/refresh-token.model';
import { AuthTokens } from '../types';
import { AUTH_MESSAGES } from '../constants/messages';
import { sendVerificationEmail } from './email.service';
import config from '../config';

interface UserResponse {
  id: string;
  email: string;
  password: string;
  name: string;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const generateAccessToken = (userId: string, email: string): string => {
  return jwt.sign(
    { userId, email },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
  );
};

const generateRefreshToken = (userId: string): string => {
  return jwt.sign(
    { userId },
    config.jwt.secret,
    { expiresIn: config.jwt.refreshExpiresIn } as jwt.SignOptions
  );
};

export const register = async (email: string, password: string, name: string): Promise<UserResponse> => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error: any = new Error(AUTH_MESSAGES.USER_EXISTS);
    error.statusCode = StatusCodes.BAD_REQUEST;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationExpires = new Date();
  verificationExpires.setHours(verificationExpires.getHours() + 24);

  const user = await User.create({
    email,
    password: hashedPassword,
    name,
    emailVerificationToken: verificationToken,
    emailVerificationExpires: verificationExpires,
  });

  try {
    await sendVerificationEmail(email, name, verificationToken);
  } catch (emailError) {
  }

  return {
    id: user._id.toString(),
    email: user.email,
    password: user.password,
    name: user.name,
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const generateTokens = async (userId: string, email: string): Promise<AuthTokens> => {
  const accessToken = generateAccessToken(userId, email);
  const refreshToken = generateRefreshToken(userId);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await RefreshToken.create({
    userId,
    token: refreshToken,
    expiresAt,
  });

  return { accessToken, refreshToken };
};

export const refreshToken = async (token: string): Promise<AuthTokens> => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as { userId: string };

    const storedToken = await RefreshToken.findOne({ token });

    if (!storedToken) {
      const error: any = new Error('Invalid refresh token');
      error.statusCode = 401;
      throw error;
    }

    if (storedToken.expiresAt < new Date()) {
      await RefreshToken.deleteOne({ token });
      const error: any = new Error('Refresh token expired');
      error.statusCode = 401;
      throw error;
    }

    const user = await User.findById(decoded.userId);

    if (!user) {
      const error: any = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const accessToken = generateAccessToken(user._id.toString(), user.email);
    const newRefreshToken = generateRefreshToken(user._id.toString());

    await RefreshToken.deleteOne({ token });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await RefreshToken.create({
      userId: user._id,
      token: newRefreshToken,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      const err: any = new Error(AUTH_MESSAGES.INVALID_REFRESH_TOKEN);
      err.statusCode = StatusCodes.UNAUTHORIZED;
      throw err;
    }
    throw error;
  }
};

export const logout = async (userId: string): Promise<void> => {
  await RefreshToken.deleteMany({ userId });
};
