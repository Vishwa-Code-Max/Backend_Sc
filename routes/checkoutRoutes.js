// routes/checkoutRoutes.js
import express from "express";
import auth from "../middleware/auth.js";
import {
  createCheckout,
  placeOrder,
  getUserOrders,
  getOrderById,
  cancelOrder
} from "../controllers/checkoutController.js";

const router = express.Router();

// All routes require authentication
router.use(auth);

// Create checkout session
router.post("/create", createCheckout);

// Place order
router.post("/place-order", placeOrder);

// Get user orders
router.get("/orders", getUserOrders);

// Get order by ID
router.get("/order/:orderId", getOrderById);

// Cancel order
router.post("/order/:orderId/cancel", cancelOrder);

export default router;