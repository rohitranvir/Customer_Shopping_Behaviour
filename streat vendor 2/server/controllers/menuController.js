const mongoose = require('mongoose');

const MenuItem = require('../models/MenuItem');

const isValidBooleanLike = (value) =>
  value === true || value === false || value === 'true' || value === 'false';

const parseBoolean = (value) => value === true || value === 'true';

const getMenuByVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(vendorId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid vendor ID.',
      });
    }

    const menuItems = await MenuItem.find({ vendorId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        count: menuItems.length,
        menuItems,
      },
    });
  } catch (error) {
    console.error('getMenuByVendor error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch menu items.',
    });
  }
};

const addMenuItem = async (req, res) => {
  try {
    const { name, price, isAvailable } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        success: false,
        error: 'Name is required.',
      });
    }

    if (price === undefined || price === null || price === '') {
      return res.status(400).json({
        success: false,
        error: 'Price is required.',
      });
    }

    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice) || numericPrice < 0) {
      return res.status(400).json({
        success: false,
        error: 'Price must be a number greater than or equal to 0.',
      });
    }

    if (isAvailable !== undefined && !isValidBooleanLike(isAvailable)) {
      return res.status(400).json({
        success: false,
        error: 'isAvailable must be true or false.',
      });
    }

    const photoUrl = req.file ? req.file.path : null;

    const menuItem = new MenuItem({
      vendorId: req.vendor.vendorId,
      name,
      price: numericPrice,
      photoUrl,
      isAvailable: isAvailable !== undefined ? parseBoolean(isAvailable) : true,
    });

    await menuItem.save();

    return res.status(201).json({
      success: true,
      data: { menuItem },
    });
  } catch (error) {
    console.error('addMenuItem error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to add menu item.',
    });
  }
};

const updateMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Menu item not found.',
      });
    }

    if (item.vendorId.toString() !== req.vendor.vendorId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this item.',
      });
    }

    const updateObj = {};
    const allowedFields = ['name', 'price', 'isAvailable'];

    allowedFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updateObj[field] = req.body[field];
      }
    });

    if (Object.prototype.hasOwnProperty.call(updateObj, 'name')) {
      if (!updateObj.name || !String(updateObj.name).trim()) {
        return res.status(400).json({
          success: false,
          error: 'Name is required.',
        });
      }
      updateObj.name = String(updateObj.name);
    }

    if (Object.prototype.hasOwnProperty.call(updateObj, 'price')) {
      const numericPrice = Number(updateObj.price);
      if (Number.isNaN(numericPrice) || numericPrice < 0) {
        return res.status(400).json({
          success: false,
          error: 'Price must be a number greater than or equal to 0.',
        });
      }
      updateObj.price = numericPrice;
    }

    if (Object.prototype.hasOwnProperty.call(updateObj, 'isAvailable')) {
      if (!isValidBooleanLike(updateObj.isAvailable)) {
        return res.status(400).json({
          success: false,
          error: 'isAvailable must be true or false.',
        });
      }
      updateObj.isAvailable = parseBoolean(updateObj.isAvailable);
    }

    if (req.file) {
      updateObj.photoUrl = req.file.path;
    }

    if (Object.keys(updateObj).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields provided for update.',
      });
    }

    const updatedItem = await MenuItem.findByIdAndUpdate(
      req.params.itemId,
      { $set: updateObj },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      data: { menuItem: updatedItem },
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid menu item ID.',
      });
    }

    console.error('updateMenuItem error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update menu item.',
    });
  }
};

const deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Menu item not found.',
      });
    }

    if (item.vendorId.toString() !== req.vendor.vendorId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this item.',
      });
    }

    await MenuItem.findByIdAndDelete(req.params.itemId);

    return res.status(200).json({
      success: true,
      data: { message: 'Menu item deleted successfully.' },
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid menu item ID.',
      });
    }

    console.error('deleteMenuItem error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete menu item.',
    });
  }
};

module.exports = {
  getMenuByVendor,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
};
