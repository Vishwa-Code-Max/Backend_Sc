// controllers/checkoutController.js
import Checkout from "../models/Checkout.js";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import ShippingAddress from "../models/ShippingAddress.js";

// Helper function to generate order ID
const generateOrderId = () => {
  const random6Digits = Math.floor(100000 + Math.random() * 900000);
  const year = new Date().getFullYear();
  return `ORD-${random6Digits}-${year}`;
};

// Create checkout session
export const createCheckout = async (req, res) => {
  try {
    console.log("Create checkout request received");
    console.log("Request body:", req.body);
    console.log("User ID:", req.user?.userId);

    const { userId } = req.user;
    const { cartId, paymentMethod, shippingMethod, shippingCost } = req.body;

    // Validate required fields
    if (!cartId) {
      console.log("Missing cart ID");
      return res.status(400).json({
        message: "Cart ID is required",
      });
    }

    if (!paymentMethod) {
      console.log("Missing payment method");
      return res.status(400).json({
        message: "Payment method is required",
      });
    }

    // Get the cart
    console.log("Looking for cart with ID:", cartId, "for user:", userId);
    const cart = await Cart.findOne({ cartId, userId });

    if (!cart) {
      console.log("Cart not found");
      return res.status(404).json({
        message: "Cart not found. Please check your cart and try again.",
      });
    }

    console.log("Cart found:", cart);

    // Get user's shipping address
    console.log("Looking for shipping address for user:", userId);
    const shippingAddress = await ShippingAddress.findOne({ userId });

    if (!shippingAddress) {
      console.log("Shipping address not found");
      return res.status(404).json({
        message:
          "Shipping address not found. Please add a shipping address first.",
      });
    }

    console.log("Shipping address found:", shippingAddress);

    // Calculate tax (18% GST)
    const tax = Math.round(cart.total * 0.18);

    // Calculate total
    const total = cart.total + (shippingCost || 0) + tax;

    console.log("Calculated totals:", {
      cartTotal: cart.total,
      shippingCost: shippingCost || 0,
      tax,
      total,
    });

    // Create checkout session with validated data
    const checkoutData = {
      userId,
      cartId,
      customer: {
        name: shippingAddress.name,
        email: shippingAddress.email,
        phone: shippingAddress.phone || "N/A",
        address: {
          street: shippingAddress.street || "N/A",
          city: shippingAddress.city || "N/A",
          state: shippingAddress.state || "N/A",
          zipCode: shippingAddress.pincode || "000000",
          country: shippingAddress.country || "India",
        },
      },
      items: cart.items,
      subtotal: cart.total,
      shipping: shippingCost || 0,
      tax: tax,
      total: total,
      paymentMethod: paymentMethod,
      shippingMethod: shippingMethod || "Standard",
      shippingTime:
        shippingMethod === "Standard"
          ? "7-10 business days"
          : shippingMethod === "Express"
            ? "3-5 business days"
            : "Next day",
    };

    console.log("Creating checkout with data:", checkoutData);

    const checkout = new Checkout(checkoutData);

    try {
      await checkout.save();
      console.log("Checkout saved successfully");
    } catch (saveError) {
      console.error("Error saving checkout:", saveError);
      return res.status(500).json({
        message: "Error saving checkout: " + saveError.message,
      });
    }

    console.log("Checkout created successfully:", checkout._id);

    res.status(201).json({
      message: "Checkout session created successfully",
      checkout: checkout.toObject(),
    });
  } catch (err) {
    console.error("Create checkout error:", err);
    res.status(500).json({
      message: "Server error while creating checkout: " + err.message,
      error: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
};

// Place order
export const placeOrder = async (req, res) => {
  try {
    console.log("Place order request:", req.body);
    const { userId } = req.user;
    const { checkoutId } = req.body;

    if (!checkoutId) {
      console.log("Missing checkout ID");
      return res.status(400).json({
        message: "Checkout ID is required",
      });
    }

    // Get checkout session
    const checkout = await Checkout.findOne({ _id: checkoutId, userId });
    if (!checkout) {
      console.log("Checkout not found:", { checkoutId, userId });
      return res.status(404).json({
        message:
          "Checkout session not found. Please start the checkout process again.",
      });
    }

    // Check if checkout is already completed
    if (checkout.status === "Completed") {
      console.log("Checkout already completed:", checkoutId);
      return res.status(400).json({
        message: "Order already placed for this checkout session.",
      });
    }

    // Generate order ID
    const orderId = generateOrderId();
    console.log("Generated order ID:", orderId);

    // Create order from checkout
    const order = new Order({
      orderId,
      userId,
      cartId: checkout.cartId,
      collectionId: checkout.collectionId || "",
      collectionName: checkout.collectionName || "",
      customer: checkout.customer,
      items: checkout.items,
      subtotal: checkout.subtotal,
      shipping: checkout.shipping,
      tax: checkout.tax,
      total: checkout.total,
      paymentMethod: checkout.paymentMethod,
      paymentStatus:
        checkout.paymentMethod === "Cash on Delivery" ? "Pending" : "Paid",
      orderStatus: "Order placed",
      statusTimeline: [{
        status: "Order placed",
        timestamp: new Date(),
        message: "Your order has been placed successfully."
      }],
      notes: checkout.notes || "",
    });

    console.log("Creating order with data:", order.toObject());

    await order.save();

    console.log("Order created successfully:", order._id);

    // Update checkout status
    checkout.status = "Completed";
    await checkout.save();

    console.log("Checkout status updated to Completed");

    // Delete the cart
    const deleteResult = await Cart.deleteOne({
      cartId: checkout.cartId,
      userId,
    });
    console.log("Cart deleted:", deleteResult);

    res.status(201).json({
      message: "Order placed successfully",
      order: order.toObject(),
      orderId: order.orderId,
    });
  } catch (err) {
    console.error("Place order error:", err);
    res.status(500).json({
      message: "Server error while placing order",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// Get user orders
export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.user;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const totalOrders = await Order.countDocuments({ userId });

    res.status(200).json({
      orders,
      pagination: {
        total: totalOrders,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalOrders / limit),
      },
    });
  } catch (err) {
    console.error("Get user orders error:", err);
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const { userId } = req.user;
    const { orderId } = req.params;

    const order = await Order.findOne({ orderId, userId }).lean();

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.status(200).json(order);
  } catch (err) {
    console.error("Get order by ID error:", err);
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// Cancel order
export const cancelOrder = async (req, res) => {
  try {
    const { userId } = req.user;
    const { orderId } = req.params;
    const { reason } = req.body;

    const order = await Order.findOne({ orderId, userId });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // Check if order can be cancelled
    const nonCancellableStatuses = ["Production start", "Preshipment Inspection", "Consignment shipped", "Order arrived"];
    if (nonCancellableStatuses.includes(order.orderStatus)) {
      return res.status(400).json({
        message: `Order cannot be cancelled as it is already ${order.orderStatus}`,
      });
    }

    // Update order status
    order.orderStatus = "Cancelled";
    order.notes = reason || "Order cancelled by customer";

    // Update payment status if paid
    if (order.paymentStatus === "Paid") {
      order.paymentStatus = "Refunded";
    }

    await order.save();

    res.status(200).json({
      message: "Order cancelled successfully",
      order: order.toObject(),
    });
  } catch (err) {
    console.error("Cancel order error:", err);
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};
