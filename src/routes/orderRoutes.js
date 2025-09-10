const express = require('express');
const router = express.Router();
const {
  createOrder,
  getAllOrders,
  getOrderById,
  getOrderByOrderId,
  updateOrder,
  updateOrderStatus,
  updatePaymentStatus,
  deleteOrder,
  getOrdersByUserId
} = require('../controllers/orderController');

// Create a new order
router.post('/', createOrder);

// Get all orders (with pagination and filtering)
router.get('/', getAllOrders);

// Get order by MongoDB _id
router.get('/:id', getOrderById);

// Get order by orderId
router.get('/order/:orderId', getOrderByOrderId);

// Get orders by user ID
router.get('/user/:userId', getOrdersByUserId);

// Update order
router.put('/:id', updateOrder);

// Update order status only
router.patch('/:id/status', updateOrderStatus);

// Update payment status only
router.patch('/:id/payment-status', updatePaymentStatus);

// Delete order
router.delete('/:id', deleteOrder);

module.exports = router;