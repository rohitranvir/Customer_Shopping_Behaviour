const mongoose = require('mongoose');

const VendorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    ownerName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['food', 'vegetables', 'snacks', 'beverages', 'other'],
      default: 'food',
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    upiId: {
      type: String,
      trim: true,
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    photoUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

VendorSchema.virtual('publicProfile').get(function publicProfile() {
  const vendorObject = this.toObject({ virtuals: false });
  delete vendorObject.passwordHash;
  return vendorObject;
});

VendorSchema.methods.toJSON = function toJSON() {
  const obj = this.toObject({ virtuals: true });
  delete obj.passwordHash;
  return obj;
};

module.exports = mongoose.model('Vendor', VendorSchema);
