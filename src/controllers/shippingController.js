const ShippingMethod = require('../models/shipping.model');
const Order = require('../models/order.model');

exports.createShippingMethod = async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        const shippingMethod = new ShippingMethod(req.body);
        await shippingMethod.save();

        res.status(201).json({
            success: true,
            message: 'Shipping method created',
            data: shippingMethod
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.updateShippingMethod = async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        const shippingMethod = await ShippingMethod.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!shippingMethod) {
            return res.status(404).json({
                success: false,
                message: 'Shipping method not found'
            });
        }

        res.json({
            success: true,
            message: 'Shipping method updated',
            data: shippingMethod
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.deleteShippingMethod = async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        // Check if this method is used in any orders
        const orderCount = await Order.countDocuments({
            shippingMethod: req.params.id
        });

        if (orderCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete shipping method used in existing orders'
            });
        }

        await ShippingMethod.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Shipping method deleted'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getShippingMethods = async (req, res) => {
    try {
        const shippingMethods = await ShippingMethod.find({ isActive: true });

        res.json({
            success: true,
            count: shippingMethods.length,
            data: shippingMethods
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.calculateShippingCost = async (req, res) => {
    try {
        const { country, state, postalCode, orderTotal, items } = req.query;

        // Get all active shipping methods
        let shippingMethods = await ShippingMethod.find({ isActive: true });

        // Filter methods available for the destination
        shippingMethods = shippingMethods.filter(method => {
            return method.regions.some(region => {
                const countryMatch = region.country === country;
                const stateMatch = !region.states || region.states.length === 0 ||
                    region.states.includes(state);
                const postalMatch = !region.postalCodes || region.postalCodes.length === 0 ||
                    region.postalCodes.some(pc => {
                        const regex = new RegExp(pc.replace('*', '.*'));
                        return regex.test(postalCode);
                    });
                return countryMatch && stateMatch && postalMatch;
            });
        });

        // Calculate final prices with potential free shipping
        const availableMethods = shippingMethods.map(method => {
            const isFreeShipping = method.minOrderValue &&
                orderTotal >= method.minOrderValue;

            return {
                ...method.toObject(),
                finalPrice: isFreeShipping ? 0 : method.price,
                isFree: isFreeShipping,
                estimatedDelivery: method.formattedDeliveryTime
            };
        });

        res.json({
            success: true,
            count: availableMethods.length,
            data: availableMethods
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.trackOrder = async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.orderId,
            user: req.user.id
        }).select('trackingNumber shippingMethod status');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        if (!order.trackingNumber) {
            return res.json({
                success: true,
                message: 'Tracking not available yet',
                data: {
                    status: order.status,
                    events: []
                }
            });
        }

        // In a real app, you would integrate with the carrier's API
        // Here we're simulating tracking data
        const trackingEvents = generateMockTrackingEvents(order);

        res.json({
            success: true,
            data: {
                trackingNumber: order.trackingNumber,
                status: order.status,
                events: trackingEvents
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Add the missing getAvailableMethodsForUser function
exports.getAvailableMethodsForUser = async (req, res) => {
    try {
        const { country, state, postalCode } = req.query;

        if (!country) {
            return res.status(400).json({
                success: false,
                message: 'Country is required'
            });
        }

        // Get all active shipping methods
        let shippingMethods = await ShippingMethod.find({ isActive: true });

        // Filter methods available for the user's location
        const availableMethods = shippingMethods.filter(method => {
            return method.regions.some(region => {
                const countryMatch = region.country === country;
                const stateMatch = !region.states || region.states.length === 0 ||
                    (state && region.states.includes(state));
                const postalMatch = !region.postalCodes || region.postalCodes.length === 0 ||
                    (postalCode && region.postalCodes.some(pc => {
                        const regex = new RegExp(pc.replace('*', '.*'));
                        return regex.test(postalCode);
                    }));
                
                return countryMatch && stateMatch && postalMatch;
            });
        });

        // Format the response
        const formattedMethods = availableMethods.map(method => ({
            _id: method._id,
            name: method.name,
            description: method.description,
            price: method.price,
            estimatedDeliveryTime: method.estimatedDeliveryTime,
            minOrderValue: method.minOrderValue,
            isActive: method.isActive
        }));

        res.json({
            success: true,
            count: formattedMethods.length,
            data: formattedMethods
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

function generateMockTrackingEvents(order) {
    const events = [];
    const now = new Date();

    if (order.status === 'processing') {
        events.push({
            date: new Date(now - 86400000 * 2),
            status: 'Order received',
            location: 'Warehouse',
            details: 'Your order has been received and is being processed'
        });
    }

    if (order.status === 'shipped') {
        events.push(
            {
                date: new Date(now - 86400000 * 2),
                status: 'Order received',
                location: 'Warehouse',
                details: 'Your order has been received'
            },
            {
                date: new Date(now - 86400000 * 1),
                status: 'Shipped',
                location: 'Mumbai',
                details: 'Your order has been shipped'
            }
        );
    }

    if (order.status === 'delivered') {
        events.push(
            {
                date: new Date(now - 86400000 * 3),
                status: 'Order received',
                location: 'Warehouse',
                details: 'Your order has been received'
            },
            {
                date: new Date(now - 86400000 * 2),
                status: 'Shipped',
                location: 'Mumbai',
                details: 'Your order has been shipped'
            },
            {
                date: new Date(now - 86400000 * 1),
                status: 'Out for delivery',
                location: 'Your City',
                details: 'Your order is out for delivery'
            },
            {
                date: new Date(now - 3600000 * 2),
                status: 'Delivered',
                location: 'Your Address',
                details: 'Your order has been delivered'
            }
        );
    }

    return events;
}