const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
const filterObj = require('./../utils/filterObj');

exports.updateUser = catchAsync(async (req, res, next) => {
  // Filter field names that are allowed
  const filteredBody = filterObj(req.body, 'email');

  // Update user document
  const updatedUser = await User.findByIdAndUpdate(
    req.user.role === 'admin' ? req.body.userId : req.user._id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedUser) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(201).json({
    status: 'success',
    data: {
      updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getMe = catchAsync(async (req, res, next) => {
  // Execute the query
  const features = new APIFeatures(User.findById(req.user.id), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const myQuery = await features.query.populate('purchases');

  res.status(200).json({
    status: 'success',
    data: {
      myQuery,
    },
  });
});

// Do not update passwords with this
exports.getAllUsers = catchAsync(async (req, res) => {
  // Execute the query
  const features = new APIFeatures(User.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const users = await features.query.populate('purchases');

  res.status(201).json({
    status: 'success',
    data: {
      users,
    },
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).populate('purchases');

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(201).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
