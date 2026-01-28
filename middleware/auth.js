// middleware/auth.js
import jwt from "jsonwebtoken";

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check token format (new tokens have userId, old ones may not)
    if (!decoded.user || !decoded.user.id) {
      return res.status(401).json({ message: "Token is not valid" });
    }

    // Set user info in request
    req.user = {
      id: decoded.user.id, // MongoDB _id
      userId: decoded.user.userId // Custom userId (if available)
    };
    
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(401).json({ message: "Token is not valid" });
  }
};

export default auth;