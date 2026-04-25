const router = require('express').Router();

const { addMenuItem, updateMenuItem, deleteMenuItem } = require('../controllers/menuController');
const { protectRoute } = require('../middleware/auth');
const { uploadMenuPhoto } = require('../middleware/upload');

const uploadMenuPhotoWrapper = (req, res, next) => {
  uploadMenuPhoto(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
    next();
  });
};

router.post('/', protectRoute, uploadMenuPhotoWrapper, addMenuItem);
router.put('/:itemId', protectRoute, uploadMenuPhotoWrapper, updateMenuItem);
router.delete('/:itemId', protectRoute, deleteMenuItem);

module.exports = router;
