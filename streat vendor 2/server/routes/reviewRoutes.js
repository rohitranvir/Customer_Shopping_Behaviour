const router = require('express').Router({ mergeParams: true });

const { getReviewsByVendor, submitReview } = require('../controllers/reviewController');

router.get('/:vendorId/reviews', getReviewsByVendor);
router.post('/:vendorId/reviews', submitReview);

module.exports = router;
