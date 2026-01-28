import Cart from "../models/Cart.js";

// Helper function to generate cart ID
const generateCartId = () => {
  const timestamp = Date.now();
  const randomNum = Math.floor(Math.random() * 10000);
  return `CRT-${timestamp}-${randomNum}`;
};
// ================= GET USER'S CART =================
export const getCart = async (req, res) => {
  try {
    const { userId } = req.user;

    // Get ALL carts for the user (not just one)
    const carts = await Cart.find({ userId })
      .sort({ createdAt: -1 }) // Most recent first
      .lean();

    if (!carts || carts.length === 0) {
      return res.status(200).json({
        carts: [],
        message: "No carts found",
      });
    }

    res.status(200).json({
      carts: carts,
      message: `Found ${carts.length} cart(s)`,
    });
  } catch (err) {
    console.error("Get cart error:", err);
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// ================= CREATE NEW CART WITH SINGLE PRODUCT =================
export const createCartWithProduct = async (req, res) => {
  try {
    const { userId } = req.user;
    const {
      productId,
      name,
      price,
      originalPrice,
      quantity,
      selectedSize,
      selectedColor,
      image,
      category,
    } = req.body;

    // Basic validation only
    if (!productId || !name || !price) {
      return res.status(400).json({
        message: "Missing required product details",
      });
    }

    // ALWAYS create a new cart for each product (similar to collections)
    const cart = new Cart({
      cartId: generateCartId(),
      userId,
      collectionId: "",
      collectionName: "",
      items: [
        {
          productId,
          name,
          price: parseFloat(price) || 0,
          originalPrice: parseFloat(originalPrice) || parseFloat(price) || 0,
          quantity: parseInt(quantity) || 1,
          selectedSize: selectedSize || "Standard",
          selectedColor: selectedColor || "Default",
          image: image || "",
          category: category || "",
        },
      ],
    });

    await cart.save();

    res.status(201).json({
      message: "New cart created with product",
      cart: cart.toObject(),
    });
  } catch (err) {
    console.error("Create cart with product error:", err);

    // Handle validation errors
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({
        message: "Validation error",
        errors: errors,
      });
    }

    // Handle duplicate key error
    if (err.code === 11000) {
      return res.status(400).json({
        message: "Duplicate cart ID error",
      });
    }

    res.status(500).json({
      message: err.message || "Server error",
      error: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
};

// ================= CREATE NEW CART WITH COLLECTION =================
export const createCartWithCollection = async (req, res) => {
  try {
    const { userId } = req.user;
    const { collectionId, collectionName, items } = req.body;

    // Validate required fields
    if (
      !collectionId ||
      !collectionName ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        message:
          "Missing required collection details: collectionId, collectionName, and items array are required",
      });
    }

    // Validate each item
    const validatedItems = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (
        !item.productId ||
        !item.name ||
        !item.price ||
        !item.selectedSize ||
        !item.selectedColor
      ) {
        return res.status(400).json({
          message: `Item ${
            i + 1
          } is missing required fields: productId, name, price, selectedSize, and selectedColor`,
        });
      }

      const validatedPrice = parseFloat(item.price);
      if (isNaN(validatedPrice) || validatedPrice <= 0) {
        return res.status(400).json({
          message: `Invalid price for item ${i + 1}`,
        });
      }

      const validatedOriginalPrice =
        parseFloat(item.originalPrice) || validatedPrice;
      const validatedQuantity = parseInt(item.quantity) || 1;

      if (validatedQuantity < 1 || validatedQuantity > 10) {
        return res.status(400).json({
          message: `Quantity must be between 1 and 10 for item ${i + 1}`,
        });
      }

      validatedItems.push({
        productId: String(item.productId),
        name: String(item.name),
        price: validatedPrice,
        originalPrice: validatedOriginalPrice,
        quantity: validatedQuantity,
        selectedSize: String(item.selectedSize),
        selectedColor: String(item.selectedColor),
        image: String(item.image || ""),
        category: String(item.category || ""),
      });
    }

    // Create NEW cart for collection
    const cart = new Cart({
      cartId: generateCartId(),
      userId,
      collectionId: String(collectionId),
      collectionName: String(collectionName),
      items: validatedItems,
    });

    await cart.save();

    console.log("Collection cart created successfully:", cart.cartId);

    res.status(201).json({
      message: "New cart created with collection products",
      cart: cart.toObject(),
    });
  } catch (err) {
    console.error("Create cart with collection error:", err);

    // Handle validation errors
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({
        message: "Validation error",
        errors: errors,
      });
    }

    // Handle duplicate key error
    if (err.code === 11000) {
      return res.status(400).json({
        message: "Duplicate cart ID error",
      });
    }

    res.status(500).json({
      message: err.message || "Server error",
      error: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
};

// ================= GET SPECIFIC CART BY CART ID =================
export const getCartById = async (req, res) => {
  try {
    const { cartId } = req.params;

    if (!cartId) {
      return res.status(400).json({
        message: "Cart ID is required",
      });
    }

    const cart = await Cart.findOne({ cartId }).lean();

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }

    res.status(200).json(cart);
  } catch (err) {
    console.error("Get cart by ID error:", err);
    res.status(500).json({
      message: err.message || "Server error",
      error: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
};

// ================= UPDATE ITEM IN SPECIFIC CART =================
export const updateCartItem = async (req, res) => {
  try {
    const { userId } = req.user;
    const { cartId, productId, selectedSize, selectedColor, quantity } =
      req.body;

    // Validate required fields
    if (!cartId || !productId || !selectedSize || !selectedColor || !quantity) {
      return res.status(400).json({
        message:
          "Missing required fields: cartId, productId, selectedSize, selectedColor, and quantity are required",
      });
    }

    const validatedQuantity = parseInt(quantity);
    if (
      isNaN(validatedQuantity) ||
      validatedQuantity < 1 ||
      validatedQuantity > 10
    ) {
      return res.status(400).json({
        message: "Quantity must be a number between 1 and 10",
      });
    }

    // Find the specific cart
    const cart = await Cart.findOne({ cartId, userId });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }

    // Find and update the item
    const itemIndex = cart.items.findIndex(
      (item) =>
        item.productId === productId &&
        item.selectedSize === selectedSize &&
        item.selectedColor === selectedColor
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        message: "Item not found in cart",
      });
    }

    cart.items[itemIndex].quantity = validatedQuantity;
    await cart.save();

    res.status(200).json({
      message: "Cart item updated successfully",
      cart: cart.toObject(),
    });
  } catch (err) {
    console.error("Update cart item error:", err);
    res.status(500).json({
      message: err.message || "Server error",
      error: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
};

// ================= REMOVE ITEM FROM SPECIFIC CART =================
export const removeFromCart = async (req, res) => {
  try {
    const { userId } = req.user;
    const { cartId, productId, selectedSize, selectedColor } = req.body;

    // Validate required fields
    if (!cartId || !productId || !selectedSize || !selectedColor) {
      return res.status(400).json({
        message:
          "Missing required fields: cartId, productId, selectedSize, and selectedColor are required",
      });
    }

    // Find the specific cart
    const cart = await Cart.findOne({ cartId, userId });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }

    const initialLength = cart.items.length;
    cart.items = cart.items.filter(
      (item) =>
        !(
          item.productId === productId &&
          item.selectedSize === selectedSize &&
          item.selectedColor === selectedColor
        )
    );

    if (cart.items.length === initialLength) {
      return res.status(404).json({
        message: "Item not found in cart",
      });
    }

    // If cart becomes empty, delete it
    if (cart.items.length === 0) {
      await Cart.findByIdAndDelete(cart._id);
      return res.status(200).json({
        message: "Cart is now empty and deleted",
        cart: null,
      });
    }

    await cart.save();

    res.status(200).json({
      message: "Item removed from cart",
      cart: cart.toObject(),
    });
  } catch (err) {
    console.error("Remove from cart error:", err);
    res.status(500).json({
      message: err.message || "Server error",
      error: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
};

// ================= DELETE SPECIFIC CART =================
export const deleteCart = async (req, res) => {
  try {
    const { userId } = req.user;
    const { cartId } = req.params;

    if (!cartId) {
      return res.status(400).json({
        message: "Cart ID is required",
      });
    }

    const cart = await Cart.findOneAndDelete({ cartId, userId });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }

    res.status(200).json({
      message: "Cart deleted successfully",
      deletedCartId: cart.cartId,
    });
  } catch (err) {
    console.error("Delete cart error:", err);
    res.status(500).json({
      message: err.message || "Server error",
      error: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
};

// ================= GET ALL CARTS FOR USER =================
export const getAllCarts = async (req, res) => {
  try {
    const { userId } = req.user;

    const carts = await Cart.find({ userId }).sort({ createdAt: -1 }).lean();

    res.status(200).json({
      carts: carts,
      count: carts.length,
    });
  } catch (err) {
    console.error("Get all carts error:", err);
    res.status(500).json({
      message: err.message || "Server error",
      error: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
};
