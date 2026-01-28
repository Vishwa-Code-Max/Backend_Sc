import mongoose from "mongoose";

const CollectionSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    images: { type: [String], default: [] }, // Array of image URLs
    availability: { type: Boolean, default: true },
    items: {
      type: [{
        count: { type: Number, default: 0 },
        products: { type: [String], default: [] }
      }],
      default: []
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model("Collection", CollectionSchema);