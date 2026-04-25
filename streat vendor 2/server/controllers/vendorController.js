const Vendor = require('../models/Vendor');
const MenuItem = require('../models/MenuItem');
const Review = require('../models/Review');

const ALLOWED_CATEGORIES = ['food', 'vegetables', 'snacks', 'beverages', 'other'];
const ALLOWED_UPDATE_FIELDS = [
  'name',
  'ownerName',
  'description',
  'upiId',
  'city',
  'state',
  'latitude',
  'longitude',
  'isOpen',
  'category',
];

const getAllVendors = async (req, res) => {
  try {
    const { category, city, isOpen, search } = req.query;
    const query = {};

    if (category) {
      query.category = category;
    }

    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }

    if (typeof isOpen !== 'undefined') {
      if (isOpen === 'true') {
        query.isOpen = true;
      } else if (isOpen === 'false') {
        query.isOpen = false;
      } else {
        return res.status(400).json({
          success: false,
          error: 'isOpen must be true or false.',
        });
      }
    }

    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      query.$or = [{ name: searchRegex }, { description: searchRegex }];
    }

    const vendors = await Vendor.find(query).select('-passwordHash').sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        count: vendors.length,
        vendors,
      },
    });
  } catch (error) {
    console.error('getAllVendors error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch vendors.',
    });
  }
};

const getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id).select('-passwordHash');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found.',
      });
    }

    const menuItems = await MenuItem.find({
      vendorId: req.params.id,
      isAvailable: true,
    }).sort({ createdAt: -1 });

    const reviews = await Review.find({ vendorId: req.params.id }).sort({ createdAt: -1 });

    const avgRating =
      reviews.length > 0
        ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
        : null;

    return res.status(200).json({
      success: true,
      data: {
        vendor,
        menuItems,
        reviews,
        avgRating,
        reviewCount: reviews.length,
      },
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid vendor ID.',
      });
    }

    console.error('getVendorById error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch vendor details.',
    });
  }
};

const updateVendorProfile = async (req, res) => {
  try {
    const vendorId = req.vendor && req.vendor.vendorId;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized access.',
      });
    }

    const updateObj = {};
    ALLOWED_UPDATE_FIELDS.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updateObj[field] = req.body[field];
      }
    });

    if (Object.keys(updateObj).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields provided for update.',
      });
    }

    if (
      Object.prototype.hasOwnProperty.call(updateObj, 'category') &&
      !ALLOWED_CATEGORIES.includes(updateObj.category)
    ) {
      return res.status(400).json({
        success: false,
        error: 'Category must be one of: food, vegetables, snacks, beverages, other.',
      });
    }

    const updatedVendor = await Vendor.findByIdAndUpdate(
      vendorId,
      { $set: updateObj },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!updatedVendor) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        vendor: updatedVendor,
      },
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation failed while updating profile.',
      });
    }

    console.error('updateVendorProfile error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update vendor profile.',
    });
  }
};

const uploadShopPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No photo uploaded.',
      });
    }

    const photoUrl = req.file.path;

    const updatedVendor = await Vendor.findByIdAndUpdate(
      req.vendor.vendorId,
      { photoUrl },
      { new: true }
    ).select('-passwordHash');

    if (!updatedVendor) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        photoUrl,
        vendor: updatedVendor,
      },
    });
  } catch (error) {
    console.error('uploadShopPhoto error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to upload shop photo.',
    });
  }
};

module.exports = {
  getAllVendors,
  getVendorById,
  updateVendorProfile,
  uploadShopPhoto,
};
