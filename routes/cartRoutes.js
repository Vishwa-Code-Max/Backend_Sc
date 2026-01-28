import express from "express";
import auth from "../middleware/auth.js";
import {
  getCart,
  createCartWithProduct,
  createCartWithCollection,
  getCartById,
  updateCartItem,
  removeFromCart,
  deleteCart,
  getAllCarts
} from "../controllers/cartController.js";

const router = express.Router();

// All routes require authentication
router.use(auth);

// Get all carts for user
router.get("/all", getAllCarts);

// Get user's carts (multiple)
router.get("/", getCart);

// Create new cart with single product
router.post("/create/product", createCartWithProduct);

// Create new cart with collection
router.post("/create/collection", createCartWithCollection);

// Update item in specific cart
router.put("/update", updateCartItem);

// Remove item from specific cart
router.delete("/remove", removeFromCart);

// Delete specific cart
router.delete("/:cartId", deleteCart);

// Get cart by cart ID (public route)
router.get("/:cartId", getCartById);

export default router;