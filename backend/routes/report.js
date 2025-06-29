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
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Configure Multer with Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'anonymous-reports',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }]
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024,
    files: 5
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Submit report endpoint
router.post('/submit', upload.array('photos', 5), async (req, res) => {
  try {
    const { description, location } = req.body;
    
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
    const photos = req.files.map(file => file.path);

    const report = await Report.create({
      description,
      location,
      photos
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully.',
      report
    });

  } catch (error) {
    console.error('Report submission error:', error);
    
    if (req.files?.length > 0) {
      await Promise.all(req.files.map(file => 
        cloudinary.uploader.destroy(file.filename)
      ));
    }

    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to submit report'
    });
  }
});

// Get reports for forum
// router.get('/forum', async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     const sortBy = req.query.sortBy || 'submittedAt';
//     const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

//     const query = {};
//     if (req.query.location) query.location = new RegExp(req.query.location, 'i');

//     const total = await Report.countDocuments(query);

//     const reports = await Report.find(query)
//       .sort({ [sortBy]: sortOrder })
//       .skip(skip)
//       .limit(limit)
//       .lean();

//     // Ensure photos array exists and contains valid URLs
//     const processedReports = reports.map(report => ({
//       ...report,
//       photos: Array.isArray(report.photos) 
//         ? report.photos.map(photo => {
//             if (typeof photo === 'string') {
//               return photo.startsWith('http://') 
//                 ? photo.replace('http://', 'https://') 
//                 : photo;
//             }
//             return photo;
//           }).filter(photo => photo)
//         : []
//     }));

//     res.set({
//       'Cache-Control': 'public, max-age=3600'
//     });

//     res.status(200).json({
//       success: true,
//       data: processedReports,
//       pagination: {
//         total,
//         page,
//         pages: Math.ceil(total / limit),
//         limit
//       }
//     });

//   } catch (error) {
//     console.error('Error fetching reports:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch reports'
//     });
//   }
// });
// Get reports for forum
router.get('/forum', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const sortBy = req.query.sortBy || 'submittedAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const query = {};
    if (req.query.location) query.location = new RegExp(req.query.location, 'i');

    const total = await Report.countDocuments(query);

    const reports = await Report.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();

    console.log('Raw reports from DB:', reports.map(r => ({ 
      id: r._id, 
      photos: r.photos,
      photosType: typeof r.photos,
      photosLength: Array.isArray(r.photos) ? r.photos.length : 'not array'
    })));

    // Validate and format image URLs
    const validateImageUrl = (url) => {
      if (!url || typeof url !== 'string') return null;
      
      const trimmedUrl = url.trim();
      if (!trimmedUrl) return null;
      
      try {
        // Check if it's a relative path and convert to absolute
        if (trimmedUrl.startsWith('/uploads/') || trimmedUrl.startsWith('uploads/')) {
          // Assuming your server serves static files from /uploads
          const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
          return `${baseUrl}/${trimmedUrl.replace(/^\//, '')}`;
        }
        
        // Check if it's already a full URL
        const urlObj = new URL(trimmedUrl);
        
        // Ensure HTTPS for external URLs (optional, remove if you need HTTP)
        if (urlObj.hostname !== 'localhost' && urlObj.hostname !== '127.0.0.1' && urlObj.protocol === 'http:') {
          urlObj.protocol = 'https:';
        }
        
        return urlObj.toString();
      } catch (error) {
        console.log('Invalid URL format:', url, error.message);
        return null;
      }
    };

    // Process reports to ensure photos array exists and contains valid URLs
    const processedReports = reports.map(report => {
      let validPhotos = [];
      
      if (Array.isArray(report.photos)) {
        validPhotos = report.photos
          .map(photo => validateImageUrl(photo))
          .filter(photo => photo !== null);
      }
      
      console.log(`Report ${report._id} photo processing:`, {
        original: report.photos,
        processed: validPhotos,
        count: validPhotos.length
      });
      
      return {
        ...report,
        photos: validPhotos
      };
    });

    // Add CORS headers for image requests
    res.set({
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    });

    res.status(200).json({
      success: true,
      data: processedReports,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    });

  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;