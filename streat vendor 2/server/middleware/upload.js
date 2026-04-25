const cloudinary = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

const generatePublicId = () => `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

const imageFileFilter = (req, file, cb) => {
  if (!file.mimetype || !file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed'), false);
  }

  cb(null, true);
};

const uploadLimits = {
  fileSize: 5 * 1024 * 1024,
};

const shopStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'vendorconnect/shops',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 600, crop: 'limit', quality: 'auto' }],
    public_id: () => generatePublicId(),
  },
});

const uploadShopPhoto = multer({
  storage: shopStorage,
  limits: uploadLimits,
  fileFilter: imageFileFilter,
}).single('photo');

const menuStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'vendorconnect/menu',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 600, crop: 'limit', quality: 'auto' }],
    public_id: () => generatePublicId(),
  },
});

const uploadMenuPhoto = multer({
  storage: menuStorage,
  limits: uploadLimits,
  fileFilter: imageFileFilter,
}).single('photo');

const multerErrorHandler = (err, req, res, next) => {
  if (err && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: 'File too large. Maximum size is 5MB.',
    });
  }

  if (err && err.message === 'Only image files are allowed') {
    return res.status(400).json({
      success: false,
      error: 'Only image files (jpg, jpeg, png, webp) are allowed.',
    });
  }

  next(err);
};

module.exports = { uploadShopPhoto, uploadMenuPhoto, multerErrorHandler };