const router = require('express').Router();

const {
  getAllVendors,
  getVendorById,
  updateVendorProfile,
  uploadShopPhoto: uploadShopPhotoController,
} = require('../controllers/vendorController');
const menuController = require('../controllers/menuController');
const reviewController = require('../controllers/reviewController');
const { protectRoute } = require('../middleware/auth');
const {
  uploadShopPhoto: uploadShopPhotoMiddleware,
  multerErrorHandler,
} = require('../middleware/upload');

router.get('/', getAllVendors);
router.put('/profile', protectRoute, updateVendorProfile);
router.post(
  '/profile/photo',
  protectRoute,
  uploadShopPhotoMiddleware,
  uploadShopPhotoController,
  multerErrorHandler
);
router.get('/:vendorId/reviews', reviewController.getReviewsByVendor);
router.post('/:vendorId/reviews', reviewController.submitReview);
router.get('/:vendorId/menu', menuController.getMenuByVendor);
router.get('/:id', getVendorById);

module.exports = router;
