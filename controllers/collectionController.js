import Collection from "../models/Collection.js";

// CREATE COLLECTION
export const createCollection = async (req, res) => {
  try {
    const collectionData = {
      ...req.body,
      availability: req.body.availability === 'true' || req.body.availability === true
    };
    
    const collection = await Collection.create(collectionData);
    res.status(201).json(collection);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// READ ALL COLLECTIONS
export const getCollections = async (req, res) => {
  try {
    const collections = await Collection.find().sort({ createdAt: -1 });
    res.json(collections);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// READ SINGLE COLLECTION BY ID
export const getCollectionById = async (req, res) => {
  try {
    const collection = await Collection.findOne({ id: req.params.id });

    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    res.json(collection);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE COLLECTION
export const updateCollection = async (req, res) => {
  try {
    const collection = await Collection.findOneAndUpdate(
      { id: req.params.id },
      { 
        ...req.body,
        availability: req.body.availability === 'true' || req.body.availability === true,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }
    
    res.json(collection);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE COLLECTION
export const deleteCollection = async (req, res) => {
  try {
    const collection = await Collection.findOneAndDelete({ id: req.params.id });
    
    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }
    
    res.json({ message: "Collection deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};