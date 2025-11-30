import crypto from 'crypto';
import { StatusCodes } from 'http-status-codes';
import User from '../models/user.model';
import { AUTH_MESSAGES, USER_MESSAGES } from '../constants/messages';
import { sendVerificationEmail, sendWelcomeEmail } from './email.service';

export const verifyEmail = async (token: string): Promise<void> => {
  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: new Date() },
  });

  if (!user) {
    const error: any = new Error(AUTH_MESSAGES.INVALID_VERIFICATION_TOKEN);
    error.statusCode = StatusCodes.BAD_REQUEST;
    throw error;
  }

  // Update user
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  // Send welcome email
  try {
    await sendWelcomeEmail(user.email, user.name);
  } catch (error) {
  }
};

export const resendVerificationEmail = async (email: string): Promise<void> => {
  const user = await User.findOne({ email });

  if (!user) {
    const error: any = new Error(USER_MESSAGES.USER_NOT_FOUND);
    error.statusCode = StatusCodes.NOT_FOUND;
    throw error;
  }

  if (user.isEmailVerified) {
    const error: any = new Error('Email is already verified');
    error.statusCode = StatusCodes.BAD_REQUEST;
    throw error;
  }

  // Generate new verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationExpires = new Date();
  verificationExpires.setHours(verificationExpires.getHours() + 24);

  user.emailVerificationToken = verificationToken;
  user.emailVerificationExpires = verificationExpires;
  await user.save();

  // Send verification email
  await sendVerificationEmail(user.email, user.name, verificationToken);
};
