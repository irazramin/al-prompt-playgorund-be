export const AUTH_MESSAGES = {
  REGISTER_SUCCESS: 'User registered successfully. Please check your email to verify your account.',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  TOKEN_REFRESHED: 'Token refreshed successfully',
  INVALID_CREDENTIALS: 'Invalid credentials',
  USER_EXISTS: 'User already exists',
  EMAIL_REQUIRED: 'Email is required',
  PASSWORD_REQUIRED: 'Password is required',
  NAME_REQUIRED: 'Name is required',
  EMAIL_PASSWORD_REQUIRED: 'Email and password are required',
  REFRESH_TOKEN_REQUIRED: 'Refresh token is required',
  INVALID_REFRESH_TOKEN: 'Invalid refresh token',
  REFRESH_TOKEN_EXPIRED: 'Refresh token expired',
  AUTHENTICATION_REQUIRED: 'Authentication required',
  AUTHENTICATION_FAILED: 'Authentication failed',
  INVALID_TOKEN: 'Invalid token',
  TOKEN_EXPIRED: 'Token expired',
  UNAUTHORIZED: 'Unauthorized',
  EMAIL_NOT_VERIFIED: 'Please verify your email before logging in',
  EMAIL_VERIFIED: 'Email verified successfully',
  INVALID_VERIFICATION_TOKEN: 'Invalid or expired verification token',
  VERIFICATION_TOKEN_REQUIRED: 'Verification token is required',
};

export const USER_MESSAGES = {
  PROFILE_UPDATED: 'Profile updated successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  ACCOUNT_DELETED: 'Account deleted successfully',
  USER_NOT_FOUND: 'User not found',
  EMAIL_IN_USE: 'Email already in use',
  CURRENT_PASSWORD_INCORRECT: 'Current password is incorrect',
  PASSWORD_INCORRECT: 'Password is incorrect',
  NAME_EMAIL_REQUIRED: 'At least one field (name or email) is required',
  PASSWORD_FIELDS_REQUIRED: 'Current password and new password are required',
  PASSWORD_MIN_LENGTH: 'New password must be at least 6 characters',
  PASSWORD_REQUIRED_DELETE: 'Password is required to delete account',
};

export const ERROR_MESSAGES = {
  NOT_FOUND: 'Not Found',
  INTERNAL_SERVER_ERROR: 'Internal server error',
  BAD_REQUEST: 'Bad request',
  VALIDATION_ERROR: 'Validation error',
};

export const SUCCESS_MESSAGES = {
  OPERATION_SUCCESS: 'Operation completed successfully',
};
