const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profile-photos/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// GET /user/profile - Get authenticated user's profile
router.get('/profile', authenticate, async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                profilePhoto: req.user.profilePhoto,
                address: req.user.address,
                phone: req.user.phone
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error fetching profile'
        });
    }
});

// PUT /user/profile - Update user profile
router.put('/profile', authenticate, upload.single('profilePhoto'), async (req, res) => {
    try {
        const { name, email, phone, address } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        // Update fields
        if (name) user.name = name;
        if (email) user.email = email;
        if (phone) user.phone = phone;
        if (address) user.address = address;

        // Handle profile photo upload
        if (req.file) {
            user.profilePhoto = `/uploads/profile-photos/${req.file.filename}`;
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                profilePhoto: user.profilePhoto
            }
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ 
            success: false,
            message: error.message || 'Error updating profile'
        });
    }
});

module.exports = router;