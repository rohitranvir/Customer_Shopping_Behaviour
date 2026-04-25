const mongoose = require('mongoose');

const Review = require('../models/Review');
const Vendor = require('../models/Vendor');

const getReviewsByVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(vendorId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid vendor ID.',
      });
    }

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found.',
      });
    }

    const reviews = await Review.find({ vendorId }).sort({ createdAt: -1 });

    const avgRating =
      reviews.length > 0
        ? parseFloat(
            (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
          )
        : null;

    return res.status(200).json({
      success: true,
      data: {
        vendorId,
        reviewCount: reviews.length,
        avgRating,
        reviews,
      },
    });
  } catch (error) {
    console.error('getReviewsByVendor error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch reviews.',
    });
  }
};

const submitReview = async (req, res) => {
  try {
    const { vendorId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(vendorId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid vendor ID.',
      });
    }

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found.',
      });
    }

    const { customerName, rating, comment } = req.body;

    if (typeof customerName !== 'string' || !customerName.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Customer name is required.',
      });
    }

    if (customerName.trim().length > 100) {
      return res.status(400).json({
        success: false,
        error: 'Customer name must not exceed 100 characters.',
      });
    }

    if (rating === undefined || rating === null || rating === '') {
      return res.status(400).json({
        success: false,
        error: 'Rating is required.',
      });
    }

    const numericRating = Number(rating);
    if (Number.isNaN(numericRating)) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be a number.',
      });
    }

    if (numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5.',
      });
    }

    if (comment !== undefined && comment !== null && String(comment).trim().length > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Comment must not exceed 1000 characters.',
      });
    }

    const review = await Review.create({
      vendorId,
      customerName: customerName.trim(),
      rating: numericRating,
      comment: comment ? String(comment).trim() : '',
    });

    return res.status(201).json({
      success: true,
      data: { review },
    });
  } catch (error) {
    console.error('submitReview error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to submit review.',
    });
  }
};

module.exports = { getReviewsByVendor, submitReview };
