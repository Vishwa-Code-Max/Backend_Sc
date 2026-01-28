// models/Checkout.js
import mongoose from "mongoose";

const CheckoutSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    cartId: {
      type: String,
      required: true,
    },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, default: "N/A" }, // Made optional
      address: {
        street: { type: String, default: "N/A" }, // Made optional
        city: { type: String, default: "N/A" }, // Made optional
        state: { type: String, default: "N/A" }, // Made optional
        zipCode: { type: String, default: "000000" }, // Made optional
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
      min: 0,
    },
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    shipping: {
      type: Number,
      default: 0,
    },
    shippingMethod: {
      type: String,
      default: "Standard"
    },
    shippingTime: {
      type: String,
      default: "7-10 business days"
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["Cash on Delivery", "Online Gateway", "Card", "UPI"],
      default: "Cash on Delivery",
    },
    status: {
      type: String,
      default: "Draft",
      enum: ["Draft", "Processing", "Completed", "Cancelled"],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Checkout", CheckoutSchema);