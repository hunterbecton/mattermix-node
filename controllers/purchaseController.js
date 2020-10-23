const Purchase = require('./../models/purchaseModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const filterObj = require('./../utils/filterObj');

exports.getAllPurchases = catchAsync(async (req, res, next) => {
  let filter = {};

  // Execute the query
  const features = new APIFeatures(
    Purchase.find(filter).populate({
      path: 'user product',
      select: '-tokens -createdAt -updatedAt -__v',
    }),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const purchases = await features.query;

  res.status(201).json({
    status: 'success',
    data: {
      purchases,
    },
  });
});

exports.getPurchase = catchAsync(async (req, res, next) => {
  const purchase = await Purchase.findById(req.params.id).populate({
    path: 'user product',
    select: '-tokens -createdAt -updatedAt -__v',
  });

  if (!purchase) {
    return next(new AppError('No purchase found with that ID', 404));
  }

  res.status(201).json({
    status: 'success',
    data: {
      purchase,
    },
  });
});

exports.createPurchase = catchAsync(async (req, res, next) => {
  // Filter field names that are allowed
  const filteredBody = filterObj(req.body, 'product', 'amount', 'user');

  const purchase = await Purchase.create({
    ...filteredBody,
  });

  res.status(201).json({
    status: 'success',
    data: {
      purchase,
    },
  });
});

exports.updatePurchase = catchAsync(async (req, res, next) => {
  // Filter field names that are allowed
  const filteredBody = filterObj(req.body, 'product', 'amount', 'user');

  const purchase = await Purchase.findOneAndUpdate(
    {
      _id: req.params.id,
    },
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!purchase) {
    return next(new AppError('No purchase found with that ID', 404));
  }

  res.status(201).json({
    status: 'success',
    data: {
      purchase,
    },
  });
});

exports.deletePurchase = catchAsync(async (req, res, next) => {
  const purchase = await Purchase.findOneAndDelete({
    _id: req.params.id,
  });

  if (!purchase) {
    return next(new AppError('No purchase found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
