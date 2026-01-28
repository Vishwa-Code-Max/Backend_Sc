// Upload single image for collection
export const uploadCollectionImage = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const imageUrl = `/uploads/collections/${req.file.filename}`;
    
    res.status(200).json({
      success: true,
      imageUrl: imageUrl
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error uploading file' 
    });
  }
};

// Upload multiple images for collection
export const uploadCollectionImages = (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    
    const imageUrls = req.files.map(file => 
      `/uploads/collections/${file.filename}`
    );
    
    res.status(200).json({
      success: true,
      imageUrls: imageUrls
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error uploading files' 
    });
  }
};

// Upload product image
export const uploadProductImage = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const imageUrl = `/uploads/products/${req.file.filename}`;
    
    res.status(200).json({
      success: true,
      imageUrl: imageUrl
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error uploading file' 
    });
  }
};

// Upload multiple product images
export const uploadProductImages = (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    
    const imageUrls = req.files.map(file => 
      `/uploads/products/${file.filename}`
    );
    
    res.status(200).json({
      success: true,
      imageUrls: imageUrls
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error uploading files' 
    });
  }
};