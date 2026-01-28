// controllers/shippingController.js
import ShippingAddress from "../models/ShippingAddress.js";
import User from "../models/User.js";

// ================= GET SHIPPING ADDRESS =================
export const getShippingAddress = async (req, res) => {
  try {
    console.log("Fetching shipping address for user:", req.user);
    
    // req.user.id is the MongoDB _id from JWT token
    const address = await ShippingAddress.findOne({
      userId: req.user.userId
    });

    // Return empty object if no address exists
    res.json(address || {});
  } catch (error) {
    console.error("Get shipping address error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ================= SAVE / UPDATE SHIPPING ADDRESS =================
export const saveShippingAddress = async (req, res) => {
  try {
    console.log("Saving shipping address for user:", req.user);
    console.log("Address data:", req.body);

    const userId = req.user.userId;
    const data = req.body;

    // Get user information to include name and email
    const user = await User.findOne({ userId });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate required fields
    const requiredFields = ['street', 'city', 'state', 'pincode', 'phone'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }

    // Save/update address with user's name and email
    const address = await ShippingAddress.findOneAndUpdate(
      { userId },
      { 
        ...data, 
        userId,
        name: user.name,
        email: user.email,
        country: data.country || "India" 
      },
      { 
        new: true, 
        upsert: true,
        runValidators: true 
      }
    );

    console.log("Address saved successfully:", address);
    res.json(address);
  } catch (error) {
    console.error("Save shipping address error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ================= DELETE SHIPPING ADDRESS =================
export const deleteShippingAddress = async (req, res) => {
  try {
    console.log("Deleting shipping address for user:", req.user);
    
    const deletedAddress = await ShippingAddress.findOneAndDelete({
      userId: req.user.userId
    });

    if (!deletedAddress) {
      return res.status(404).json({ message: "Shipping address not found" });
    }

    res.json({ 
      message: "Shipping address deleted successfully",
      deletedAddress 
    });
  } catch (error) {
    console.error("Delete shipping address error:", error);
    res.status(500).json({ message: error.message });
  }
};