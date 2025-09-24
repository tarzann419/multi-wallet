import {
  registerUser as registerUserService,
  loginUser as loginUserService,
  getUserProfile as getUserProfileService,
  getUserProfileByEmail as getUserProfileByEmailService,
  updateUserProfile as updateUserProfileService,
  changeUserPassword as changeUserPasswordService,
} from '../../services/auth/auth.service.js';
import { successResponse, errorResponse } from '../../utils/responseHandler.js';

export const registerUser = async (req, res) => {
  try {
    const userData = req.body;
    const newUser = await registerUserService(userData);
    return successResponse(
      res,
      'User registered successfully',
      { user: newUser },
      201
    );
  } catch (error) {
    console.error('Registration error:', error);

    // Handle user already exists
    if (error.message === 'User already exists') {
      return errorResponse(res, error.message, 400, 'USER_EXISTS');
    }

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message,
      }));
      return errorResponse(
        res,
        'Validation failed',
        400,
        'VALIDATION_ERROR',
        validationErrors
      );
    }

    // Handle duplicate key errors (MongoDB unique constraint)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return errorResponse(
        res,
        `${field} already exists`,
        400,
        'DUPLICATE_ERROR'
      );
    }

    return errorResponse(res, 'Server error', 500, 'SERVER_ERROR');
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await loginUserService(email, password);
    return successResponse(res, 'Login successful', { user, token });
  } catch (error) {
    console.error('Login error:', error);
    if (
      error.message === 'User not found' ||
      error.message === 'Invalid credentials'
    ) {
      return errorResponse(res, error.message, 400, 'INVALID_CREDENTIALS');
    }
    return errorResponse(res, 'Server error', 500, 'SERVER_ERROR');
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await getUserProfileService(userId);
    return successResponse(res, 'User profile fetched successfully', { user });
  } catch (error) {
    if (error.message === 'User not found') {
      return errorResponse(res, error.message, 404, 'USER_NOT_FOUND');
    }
    return errorResponse(res, 'Server error', 500, 'SERVER_ERROR');
  }
};

export const getUserProfileByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await getUserProfileByEmailService(email);
    return successResponse(res, 'User profile fetched successfully', { user });
  } catch (error) {
    if (error.message === 'User not found') {
      return errorResponse(res, error.message, 404, 'USER_NOT_FOUND');
    }
    return errorResponse(res, 'Server error', 500, 'SERVER_ERROR');
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;
    const updatedUser = await updateUserProfileService(userId, updateData);
    return successResponse(res, 'User profile updated successfully', {
      user: updatedUser,
    });
  } catch (error) {
    if (error.message === 'User not found') {
      return errorResponse(res, error.message, 404, 'USER_NOT_FOUND');
    }
    return errorResponse(res, 'Server error', 500, 'SERVER_ERROR');
  }
};

export const changeUserPassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    await changeUserPasswordService(userId, currentPassword, newPassword);
    return successResponse(res, 'Password changed successfully');
  } catch (error) {
    if (
      error.message === 'User not found' ||
      error.message === 'Current password is incorrect'
    ) {
      return errorResponse(res, error.message, 400, 'INVALID_REQUEST');
    }
    return errorResponse(res, 'Server error', 500, 'SERVER_ERROR');
  }
};
