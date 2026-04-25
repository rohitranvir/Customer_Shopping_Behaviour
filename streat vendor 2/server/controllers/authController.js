const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Vendor = require('../models/Vendor');

const ALLOWED_CATEGORIES = ['food', 'vegetables', 'snacks', 'beverages', 'other'];

const registerVendor = async (req, res) => {
  try {
    const {
      name,
      ownerName,
      phone,
      password,
      category,
      city,
      state,
      description,
      upiId,
      email,
    } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        success: false,
        error: 'Name is required.',
      });
    }

    if (!ownerName || !String(ownerName).trim()) {
      return res.status(400).json({
        success: false,
        error: 'Owner name is required.',
      });
    }

    if (!phone || !String(phone).trim()) {
      return res.status(400).json({
        success: false,
        error: 'Phone is required.',
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Password is required.',
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long.',
      });
    }

    const selectedCategory = category || 'food';
    if (!ALLOWED_CATEGORIES.includes(selectedCategory)) {
      return res.status(400).json({
        success: false,
        error: 'Category must be one of: food, vegetables, snacks, beverages, other.',
      });
    }

    const normalizedPhone = String(phone).trim();
    const existingPhoneVendor = await Vendor.findOne({ phone: normalizedPhone });
    if (existingPhoneVendor) {
      return res.status(409).json({
        success: false,
        error: 'Phone number already registered.',
      });
    }

    let normalizedEmail;
    if (email && String(email).trim()) {
      normalizedEmail = String(email).trim().toLowerCase();
      const existingEmailVendor = await Vendor.findOne({ email: normalizedEmail });
      if (existingEmailVendor) {
        return res.status(409).json({
          success: false,
          error: 'Email already registered.',
        });
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const vendor = new Vendor({
      name,
      ownerName,
      phone: normalizedPhone,
      email: normalizedEmail,
      passwordHash,
      category: selectedCategory,
      city,
      state,
      description,
      upiId,
    });

    await vendor.save();

    const token = jwt.sign(
      { vendorId: vendor._id, phone: vendor.phone },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      data: {
        token,
        vendor: vendor.toJSON(),
      },
    });
  } catch (error) {
    console.error('registerVendor error:', error);
    return res.status(500).json({
      success: false,
      error: 'Registration failed.',
    });
  }
};

const loginVendor = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !String(phone).trim()) {
      return res.status(400).json({
        success: false,
        error: 'Phone is required.',
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Password is required.',
      });
    }

    const normalizedPhone = String(phone).trim();
    const vendor = await Vendor.findOne({ phone: normalizedPhone });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: 'No account found with this phone number.',
      });
    }

    const isMatch = await bcrypt.compare(password, vendor.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Incorrect password.',
      });
    }

    const token = jwt.sign(
      { vendorId: vendor._id, phone: vendor.phone },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      data: {
        token,
        vendor: vendor.toJSON(),
      },
    });
  } catch (error) {
    console.error('loginVendor error:', error);
    return res.status(500).json({
      success: false,
      error: 'Login failed.',
    });
  }
};

module.exports = { registerVendor, loginVendor };
