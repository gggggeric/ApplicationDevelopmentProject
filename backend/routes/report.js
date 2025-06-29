const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer with Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'anonymous-reports',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [{ width: 1024, height: 1024, crop: 'limit' }]
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Max 5 files
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

router.post('/submit', upload.array('photos', 5), async (req, res) => {
  try {
    const { description, location } = req.body;
    
    // Validation
    if (!description || !location) {
      return res.status(400).json({ 
        success: false,
        message: 'Description and location are required.' 
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'At least one photo is required.' 
      });
    }

    // Get Cloudinary URLs
    const photoUrls = req.files.map(file => file.path);

    // Create report
    const report = await Report.create({
      description,
      location,
      photos: photoUrls
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully.',
      report
    });

  } catch (error) {
    console.error('Report submission error:', error);
    
    let errorMessage = 'Failed to submit report.';
    if (error.message.includes('File too large')) {
      errorMessage = 'File size exceeds 10MB limit.';
    } else if (error.message.includes('Only image files')) {
      errorMessage = 'Only image files are allowed.';
    }

    res.status(500).json({ 
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;