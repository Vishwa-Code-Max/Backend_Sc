// controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Helper function to generate user ID
const generateUserId = () => {
  const random6Digits = Math.floor(100000 + Math.random() * 900000); // 6 random digits
  const year = new Date().getFullYear(); // Current year
  return `USR-${random6Digits}-${year}`;
};

// Generate JWT
const generateToken = (userId, userMongoId) => {
  return jwt.sign(
    { 
      user: { 
        id: userMongoId, // Keep MongoDB _id for internal reference
        userId: userId // Add custom userId to token
      } 
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ================= REGISTER =================
export const register = async (req, res) => {
  const { name, email, password, userId: frontendUserId } = req.body;

  try {
    // Check if user already exists
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Generate or use provided userId
    let userId;
    let isUserIdUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    // Try to generate unique userId
    while (!isUserIdUnique && attempts < maxAttempts) {
      if (frontendUserId && attempts === 0) {
        // Use frontend-provided userId first
        userId = frontendUserId;
      } else {
        // Generate new one if frontend ID exists or after first attempt
        userId = generateUserId();
      }
      
      // Check if userId already exists
      const userIdExists = await User.findOne({ userId });
      if (!userIdExists) {
        isUserIdUnique = true;
      }
      attempts++;
    }

    if (!isUserIdUnique) {
      return res.status(500).json({ 
        message: "Failed to generate unique user ID. Please try again." 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      userId,
      name,
      email,
      password: hashedPassword,
    });

    // Generate token
    const token = generateToken(user.userId, user._id);

    // Update last token
    await User.findByIdAndUpdate(user._id, { lastToken: token });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ 
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// ================= LOGIN =================
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user.userId, user._id);

    await User.findByIdAndUpdate(user._id, { lastToken: token });

    res.json({
      token,
      user: {
        id: user._id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ 
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// ================= GET USER =================
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= UPDATE USER =================
export const updateUser = async (req, res) => {
  const { name, email, phone } = req.body;

  try {
    if (email) {
      const emailExists = await User.findOne({ email });
      if (emailExists && emailExists._id.toString() !== req.user.id) {
        return res.status(409).json({ message: "Email already in use" });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, email, phone },
      { new: true }
    ).select("-password");

    res.json(user);
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= LOGOUT =================
export const logout = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { lastToken: null });
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= GET USER BY ID ================= (Optional)
export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({ userId }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("Get user by ID error:", err);
    res.status(500).json({ message: "Server error" });
  }
};