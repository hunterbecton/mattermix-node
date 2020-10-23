const Product = require('../models/productModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const filterObj = require('./../utils/filterObj');

exports.getAllProducts = catchAsync(async (req, res, next) => {
  let filter = {};

  // Execute the query
  const features = new APIFeatures(Product.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const products = await features.query;

  res.status(201).json({
    status: 'success',
    data: {
      products,
    },
  });
});

exports.getProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  res.status(201).json({
    status: 'success',
    data: {
      product,
    },
  });
});

exports.createProduct = catchAsync(async (req, res, next) => {
  // Filter field names that are allowed
  const filteredBody = filterObj(req.body, 'title', 'amount', 'stripeId');

  const product = await Product.create({
    ...filteredBody,
  });

  res.status(201).json({
    status: 'success',
    data: {
      product,
    },
  });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  // Filter field names that are allowed
  const filteredBody = filterObj(req.body, 'title', 'amount', 'stripeId');

  const product = await Product.findOneAndUpdate(
    {
      _id: req.params.id,
    },
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  res.status(201).json({
    status: 'success',
    data: {
      product,
    },
  });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findOneAndDelete({
    _id: req.params.id,
  });

  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
