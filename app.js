const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRoutes');
const productRouter = require('./routes/productRoutes');
const purchaseRouter = require('./routes/purchaseRoutes');
const stripeRouter = require('./routes/stripeRoutes');
const stripeController = require('./controllers/stripeController');

const app = express();

app.enable('trust proxy');

app.set('view engine', 'ejs');

// Global Middlewares
const corsOptions = {
  origin: `${process.env.HOST}`,
  credentials: true,
};

// Use cors
app.use(cors(corsOptions));

// Security HTTP headers
app.use(helmet());

// Dev logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests
const limiter = rateLimit({
  max: 500,
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: 'Too many requests from this IP. Please retry in 15 minutes',
});

app.use(`/api`, limiter);

// Webhooks
app.post(
  '/webhook-checkout',
  bodyParser.raw({ type: 'application/json' }),
  stripeController.webhookCheckout
);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data santization agaisnt noSQL query injection
app.use(mongoSanitize());

// Prevent parameters pollution
app.use(
  hpp({
    whitelist: ['amount'],
  })
);

// Data santization against XSS
app.use(xss());

// Compress text sent to client
app.use(compression());

// Routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/purchases', purchaseRouter);
app.use('/api/v1/stripe', stripeRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on the server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
