const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Purchase = require('../models/purchaseModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const filterObj = require('./../utils/filterObj');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // Filter field names that are allowed
  const filteredBody = filterObj(req.body, 'customer', 'productId', 'url');

  // Get the product details
  const product = await Product.findById(filteredBody.productId);

  // Create the checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    success_url: `${process.env.HOST}${filteredBody.url}`,
    cancel_url: `${process.env.HOST}${filteredBody.url}`,
    customer: filteredBody.customer,
    client_reference_id: product.id,
    line_items: [{ price: product.stripeId, quantity: 1 }],
  });

  // Send to client
  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.getCustomerPortal = catchAsync(async (req, res, next) => {
  const session = await stripe.billingPortal.sessions.create({
    customer: req.params.customer,
    return_url: `${process.env.HOST}/templates`,
  });

  // Send to client
  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.getNewCustomerId = catchAsync(async (req, res, next) => {
  const customer = await stripe.customers.create({
    email: req.user.email,
  });

  // Save to user in db
  await User.findOneAndUpdate(
    { email: req.user.email },
    { customerId: customer.id }
  );

  res.status(200).json({
    status: 'success',
    customerId: customer.id,
  });
});

const createPaymentCheckout = async (session) => {
  const product = session.client_reference_id;
  const amount = session.amount_total;
  const user = (await User.findOne({ customerId: session.customer })).id;

  await Purchase.create({ product, amount, user });

  // Save to user in db
  await User.findOneAndUpdate(
    { customerId: session.customer },
    { role: 'pro' }
  );
};

const removeSubscription = async (session) => {
  // Save to user in db
  await User.findOneAndUpdate(
    { customerId: session.customer },
    { role: 'user' }
  );
};

exports.webhookCheckout = (req, res, next) => {
  const signature = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WH_SECRET
    );
  } catch (error) {
    return res.status(400).send(`Webhook error: ${error.message}`);
  }

  // Handle completed checkout
  if (event.type === 'checkout.session.completed') {
    createPaymentCheckout(event.data.object);

    res.status(200).json({ received: true });
  }

  // Handle upcoming expiring subscription -> subscription_schedule.expiring
  if (event.type === 'subscription_schedule.expiring') {
    // createPaymentCheckout(event.data.object);

    res.status(200).json({ received: true });
  }

  // Handle deleted subscription -> customer.subscription.deleted
  if (event.type === 'customer.subscription.deleted') {
    removeSubscription(event.data.object);

    res.status(200).json({ received: true });
  }

  // Handle refund -> charge.refunded
  if (event.type === 'charge.refunded') {
    removeSubscription(event.data.object);

    res.status(200).json({ received: true });
  }
};
