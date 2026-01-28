// models/Cart.js
import mongoose from "mongoose";

const CartItemSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  originalPrice: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1,
    max: 10
  },
  selectedSize: {
    type: String,
    required: true,
  },
  selectedColor: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: ""
  },
  category: {
    type: String,
    default: ""
  }
}, { _id: false });

const CartSchema = new mongoose.Schema({
  cartId: {
    type: String,
    unique: true,
    required: true,
  },
  userId: {
    type: String,
    required: true,
    // Remove the unique index here - allow multiple carts per user
    index: true  // Keep regular index for performance, but not unique
  },
  collectionId: {
    type: String,
    default: ""
  },
  collectionName: {
    type: String,
    default: ""
  },
  items: [CartItemSchema],
  total: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Calculate total before saving
CartSchema.pre('save', function(next) {
  this.total = this.items.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);
  next();
});

export default mongoose.model("Cart", CartSchema);