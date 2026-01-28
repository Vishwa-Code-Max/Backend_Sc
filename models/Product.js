import mongoose from "mongoose";

const StockVariantSchema = new mongoose.Schema({
  color: { type: String, required: true },
  quantity: { type: Number, default: 0 },
  images: [String]
}, { _id: false });

const StockSizeSchema = new mongoose.Schema({
  size: { type: String, required: true },
  colors: { type: Map, of: StockVariantSchema }
}, { _id: false });

const ProductSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    subcategory: String,
    description: String,
    composition: [String],
    price: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    discount: String,
    stock: {
      type: String,
      enum: ["In Stock", "Out of Stock", "Low Stock"],
      default: "In Stock"
    },
    stockDetails: {
      type: Map,
      of: {
        type: Map,
        of: {
          quantity: Number,
          images: [String]
        }
      },
      default: {}
    },
    colors: String,
    size: String,
    isVisible: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model("Product", ProductSchema);