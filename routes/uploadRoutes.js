import express from "express";
import { 
  uploadCollectionImage, 
  uploadCollectionImages,
  uploadProductImage,
  uploadProductImages 
} from "../controllers/uploadController.js";
import { collectionUpload, productUpload } from "../utils/multerConfig.js";

const router = express.Router();

// Collection image uploads
router.post("/collections/single", collectionUpload.single('image'), uploadCollectionImage);
router.post("/collections/multiple", collectionUpload.array('images', 10), uploadCollectionImages);

// Product image uploads
router.post("/products/single", productUpload.single('image'), uploadProductImage);
router.post("/products/multiple", productUpload.array('images', 10), uploadProductImages);

export default router;