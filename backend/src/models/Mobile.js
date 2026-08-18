const mongoose = require('mongoose');

const mobileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    hasImei: {
      type: Boolean,
      default: true,
    },
    imei1: {
      type: String,
      trim: true,
      default: null,
    },
    imei2: {
      type: String,
      trim: true,
      default: null,
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true,
    },
    model: {
      type: String,
      required: [true, 'Model is required'],
      trim: true,
    },
    ram: {
      type: String,
      trim: true,
      default: '',
    },
    storage: {
      type: String,
      trim: true,
      default: '',
    },
    color: {
      type: String,
      trim: true,
      default: '',
    },
    purchasePrice: {
      type: Number,
      default: 0,
      min: [0, 'Purchase price cannot be negative'],
    },
    sellingPrice: {
      type: Number,
      default: 0,
      min: [0, 'Selling price cannot be negative'],
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'SOLD'],
      default: 'AVAILABLE',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

mobileSchema.index({ user: 1, imei1: 1 }, { unique: true, partialFilterExpression: { imei1: { $type: 'string' } } });
mobileSchema.index({ user: 1, imei2: 1 }, { unique: true, partialFilterExpression: { imei2: { $type: 'string' } } });
mobileSchema.index({ user: 1, brand: 1 });
mobileSchema.index({ user: 1, model: 1 });
mobileSchema.index({ user: 1, status: 1 });
mobileSchema.index({ user: 1, createdAt: -1 });
mobileSchema.index({ user: 1, brand: 1, model: 1 });
mobileSchema.index({ user: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Mobile', mobileSchema);
