import express from "express";
import { getShippingAddress, saveShippingAddress, deleteShippingAddress} from "../controllers/shippingController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.get("/", authMiddleware, getShippingAddress);
router.post("/", authMiddleware, saveShippingAddress);
router.delete("/", authMiddleware, deleteShippingAddress);

export default router;
