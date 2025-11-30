import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import User from '../models/user.model';
import RefreshToken from '../models/refresh-token.model';
import { USER_MESSAGES } from '../constants/messages';

interface UserResponse {
  id: string;
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export const getUserById = async (userId: string): Promise<UserResponse> => {
  const user = await User.findById(userId);

  if (!user) {
    const error: any = new Error(USER_MESSAGES.USER_NOT_FOUND);
    error.statusCode = StatusCodes.NOT_FOUND;
    throw error;
  }

  return {
    id: user._id.toString(),
    email: user.email,
    password: user.password,
    name: user.name,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const updateProfile = async (
  userId: string,
  updates: { name?: string; email?: string }
): Promise<UserResponse> => {
  // Check if email is being updated and if it's already taken
  if (updates.email) {
    const existingUser = await User.findOne({ email: updates.email });
    if (existingUser && existingUser._id.toString() !== userId) {
      const error: any = new Error(USER_MESSAGES.EMAIL_IN_USE);
      error.statusCode = StatusCodes.BAD_REQUEST;
      throw error;
    }
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!user) {
    const error: any = new Error(USER_MESSAGES.USER_NOT_FOUND);
    error.statusCode = StatusCodes.NOT_FOUND;
    throw error;
  }

  return {
    id: user._id.toString(),
    email: user.email,
    password: user.password,
    name: user.name,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  const user = await User.findById(userId);

  if (!user) {
    const error: any = new Error(USER_MESSAGES.USER_NOT_FOUND);
    error.statusCode = StatusCodes.NOT_FOUND;
    throw error;
  }

  // Verify current password
  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

  if (!isPasswordValid) {
    const error: any = new Error(USER_MESSAGES.CURRENT_PASSWORD_INCORRECT);
    error.statusCode = StatusCodes.UNAUTHORIZED;
    throw error;
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password
  user.password = hashedPassword;
  await user.save();

  // Invalidate all refresh tokens for security
  await RefreshToken.deleteMany({ userId });
};
