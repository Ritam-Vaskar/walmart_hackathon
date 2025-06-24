import asyncHandler from 'express-async-handler';
import generateToken from '../utils/generateToken.js';
import User from '../models/userModel.js';

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ 'personalInfo.email': email });

  if (user && (await user.matchPassword(password))) {
    // Update last login
    user.authentication.lastLogin = new Date();
    user.authentication.loginAttempts = 0;
    await user.save();

    res.json({
      _id: user._id,
      firstName: user.personalInfo.firstName,
      lastName: user.personalInfo.lastName,
      email: user.personalInfo.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    if (user) {
      user.authentication.loginAttempts += 1;
      if (user.authentication.loginAttempts >= 5) {
        user.authentication.accountLocked = true;
      }
      await user.save();
    }
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, phone } = req.body;

  const userExists = await User.findOne({ 'personalInfo.email': email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    personalInfo: {
      firstName,
      lastName,
      email,
      phone
    },
    authentication: {
      password
    }
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      firstName: user.personalInfo.firstName,
      lastName: user.personalInfo.lastName,
      email: user.personalInfo.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      personalInfo: user.personalInfo,
      addresses: user.addresses,
      preferences: user.preferences,
      role: user.role
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.personalInfo.firstName = req.body.firstName || user.personalInfo.firstName;
    user.personalInfo.lastName = req.body.lastName || user.personalInfo.lastName;
    user.personalInfo.email = req.body.email || user.personalInfo.email;
    user.personalInfo.phone = req.body.phone || user.personalInfo.phone;
    
    if (req.body.password) {
      user.authentication.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      firstName: updatedUser.personalInfo.firstName,
      lastName: updatedUser.personalInfo.lastName,
      email: updatedUser.personalInfo.email,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Add new address
// @route   POST /api/users/address
// @access  Private
const addUserAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const newAddress = {
      ...req.body,
      isDefault: user.addresses.length === 0 // Make first address default
    };

    user.addresses.push(newAddress);
    await user.save();

    res.status(201).json(user.addresses);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update address
// @route   PUT /api/users/address/:id
// @access  Private
const updateUserAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const addressIndex = user.addresses.findIndex(
      (address) => address._id.toString() === req.params.id
    );

    if (addressIndex > -1) {
      user.addresses[addressIndex] = {
        ...user.addresses[addressIndex],
        ...req.body
      };

      await user.save();
      res.json(user.addresses);
    } else {
      res.status(404);
      throw new Error('Address not found');
    }
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

export {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  addUserAddress,
  updateUserAddress,
};