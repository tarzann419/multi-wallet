import User from '../../models/User.js';
import { errorResponse } from '../../utils/responseHandler.js';
import generateToken from '../../utils/generateToken.js';

export const registerUser = async (userData) => {
    const {
        firstName,
        lastName,
        middleName = null,
        email,
        phone,
        password,
    } = userData;
    
    // check if existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error('User already exists');
    }
    
    // create the user
    const newUser = await User.create({
        firstName,
        lastName,
        middleName,
        email,
        phone,
        password,
    });
    
    return newUser;
};

export const loginUser = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('User not found');
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new Error('Invalid credentials');
    }
    
    const token = generateToken(user._id);
    
    return { user, token };
};

export const getUserProfile = async (userId) => {
    const user = await User.findById(userId).select('-password');
    if (!user) {
        throw new Error('User not found');
    }
    return user;
};

// get profile by email
export const getUserProfileByEmail = async (email) => {
    const user = await User.findOne({ email }).select('-password');
    if (!user) {
        throw new Error('User not found');
    }
    return user;
};

// Update user profile
export const updateUserProfile = async (userId, updateData) => {
    const user = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
    }).select('-password');
    if (!user) {
        throw new Error('User not found');
    }
    return user;
};

// change user password
export const changeUserPassword = async (
    userId,
    currentPassword,
    newPassword
) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
        throw new Error('Current password is incorrect');
    }
    
    user.password = newPassword;
    await user.save();
    
    return true;
};
