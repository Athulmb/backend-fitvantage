// Calculate tax based on Indian GST rules
exports.calculateTax = (subtotal) => {
    // GST rates by category (simplified)
    const gstRates = {
        'clothing': 5,    // 5% GST for clothing
        'accessories': 12, // 12% GST for accessories
        'default': 18      // 18% GST for other categories
    };

    // In a real app, you would calculate tax per item based on its category
    // For simplicity, we're using a flat 12% rate here
    return subtotal * 0.12;
};

// Calculate shipping cost based on weight and destination
exports.calculateShipping = (shippingAddress) => {
    // Simplified shipping calculation
    // In a real app, you would integrate with shipping providers or use more complex rules

    // Free shipping for orders over ₹5000 within India
    // const subtotal = ... // You would need to pass subtotal if implementing this

    // Flat rates based on country
    const shippingRates = {
        'India': 50,
        'Pakistan': 200,
        'default': 500
    };

    return shippingRates[shippingAddress.country] || shippingRates.default;
};

// Generate a unique order number
exports.generateOrderNumber = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.floor(Math.random() * 10000).toString(36).toUpperCase();
    return `PS-${timestamp}-${random}`;
};