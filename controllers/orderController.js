// controllers/orderController.js
import Order from "../models/Order.js";
import mongoose from "mongoose";

// Get all orders (admin)
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ message: err.message });
  }
};

// Update order status (admin)
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, trackingNumber } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update order status
    order.orderStatus = status;

    // Add to timeline
    order.statusTimeline.push({
      status: status,
      timestamp: new Date(),
      message: `Order status updated to ${status}`
    });

    // If shipped, add tracking number
    if (status === "Consignment shipped" && trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    // If delivered, update payment status for COD
    if (status === "Order arrived" && order.paymentMethod === "Cash on Delivery") {
      order.paymentStatus = "Paid";
    }

    await order.save();

    res.json(order);
  } catch (err) {
    console.error("Error updating order status:", err);
    res.status(400).json({ message: err.message });
  }
};