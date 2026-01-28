// models/Order.js
import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      required: true,
      index: true
    },
    userId: {
      type: String,
      required: true,
      index: true
    },
    cartId: {
      type: String,
      required: true
    },
    collectionId: {
      type: String,
      default: ""
    },
    collectionName: {
      type: String,
      default: ""
    },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      address: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true },
        country: { type: String, default: "India" },
      },
    },
    items: [{
      productId: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      selectedSize: { type: String },
      selectedColor: { type: String },
      image: { type: String },
      category: { type: String }
    }],
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    shipping: {
      type: Number,
      default: 0,
      min: 0
    },
    tax: {
      type: Number,
      default: 0,
      min: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["Cash on Delivery", "Online Gateway", "Card", "UPI"],
      default: "Cash on Delivery"
    },
    paymentStatus: {
      type: String,
      default: "Pending",
      enum: ["Pending", "Paid", "Failed", "Refunded"]
    },
    orderStatus: {
      type: String,
      default: "Order placed",
      enum: ["Order placed", "Order Processed", "Production start", "Preshipment Inspection", "Consignment shipped", "Order arrived", "Cancelled", "Returned"]
    },
    statusTimeline: [{
      status: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
      message: { type: String }
    }],
    trackingNumber: {
      type: String,
      default: ""
    },
    estimatedDelivery: {
      type: Date
    },
    notes: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

// Calculate delivery date (7 days from now)
OrderSchema.pre('save', function (next) {
  if (!this.estimatedDelivery) {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 7);
    this.estimatedDelivery = deliveryDate;
  }
  next();
});

export default mongoose.model("Order", OrderSchema);