const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/order.model');
const Payment = require('../models/payment.model');

// Create payment intent and update order
exports.createPaymentIntent = async (orderId) => {
    try {
        const order = await Order.findById(orderId);
        if (!order) throw new Error('Order not found');

        // Create customer in Stripe (or use existing if available)
        let customer;
        const users = await User.find({ emailId: order.user.emailId });
        if (users.length > 0 && users[0].stripeCustomerId) {
            customer = users[0].stripeCustomerId;
        } else {
            const newCustomer = await stripe.customers.create({
                email: order.user.emailId,
                name: `${order.user.firstName} ${order.user.lastName}`,
                metadata: { userId: order.user._id.toString() }
            });
            customer = newCustomer.id;
            // Save stripeCustomerId to user
            await User.findByIdAndUpdate(order.user._id, { stripeCustomerId: customer });
        }

        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(order.total * 100), // Convert to paisa
            currency: 'inr',
            customer,
            description: `Payment for order ${order._id}`,
            metadata: { orderId: order._id.toString() },
            shipping: {
                name: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
                address: {
                    line1: order.shippingAddress.street,
                    city: order.shippingAddress.city,
                    state: order.shippingAddress.state,
                    postal_code: order.shippingAddress.zipCode,
                    country: 'IN'
                },
                phone: order.shippingAddress.phoneNumber
            }
        });

        // Update order with payment ID
        order.paymentId = paymentIntent.id;
        await order.save();

        return {
            clientSecret: paymentIntent.client_secret,
            paymentId: paymentIntent.id
        };
    } catch (error) {
        console.error('Stripe payment intent error:', error);
        throw error;
    }
};

// Handle Stripe webhook events
exports.handleWebhook = async (payload, sig) => {
    const event = stripe.webhooks.constructEvent(
        payload,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
        case 'payment_intent.succeeded':
            await handlePaymentSuccess(event.data.object);
            break;
        case 'payment_intent.payment_failed':
            await handlePaymentFailure(event.data.object);
            break;
        case 'charge.refunded':
            await handleRefund(event.data.object);
            break;
    }
};

async function handlePaymentSuccess(paymentIntent) {
    const order = await Order.findByIdAndUpdate(
        paymentIntent.metadata.orderId,
        {
            paymentStatus: 'paid',
            status: 'processing'
        },
        { new: true }
    );

    await new Payment({
        order: order._id,
        paymentId: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: 'completed',
        method: 'stripe',
        transactionDetails: paymentIntent
    }).save();
}

async function handlePaymentFailure(paymentIntent) {
    await Order.findByIdAndUpdate(
        paymentIntent.metadata.orderId,
        { paymentStatus: 'failed' }
    );

    await new Payment({
        order: paymentIntent.metadata.orderId,
        paymentId: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: 'failed',
        method: 'stripe',
        failureMessage: paymentIntent.last_payment_error?.message || 'Payment failed',
        transactionDetails: paymentIntent
    }).save();
}

async function handleRefund(charge) {
    const payment = await Payment.findOneAndUpdate(
        { paymentId: charge.payment_intent },
        {
            status: 'refunded',
            refundAmount: charge.amount_refunded / 100,
            refundDetails: charge
        },
        { new: true }
    );

    if (payment) {
        await Order.findByIdAndUpdate(payment.order, {
            paymentStatus: 'refunded'
        });
    }
}