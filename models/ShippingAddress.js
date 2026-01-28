// models/ShippingAddress.js
import mongoose from "mongoose";

const shippingAddressSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
      unique: true
    },
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    street: {
      type: String,
      required: true
    },
    area: String,
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    pincode: {
      type: String,
      required: true
    },
    country: { 
      type: String, 
      default: "India" 
    }
  },
  { timestamps: true }
);

export default mongoose.model("ShippingAddress", shippingAddressSchema);