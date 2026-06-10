'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema({
  fullName:    { type: String, required: true, trim: true },
  phoneNumber: { type: String, required: true, trim: true },
  state:       { type: String, required: true, trim: true },
  city:        { type: String, required: true, trim: true },
  zipCode:     { type: String, required: true, trim: true },
  address1:    { type: String, required: true, trim: true },
  address2:    { type: String, trim: true },
  country:     { type: String, required: true, trim: true, default: 'India' },
  isDefault:   { type: Boolean, default: false },
}, { _id: true, timestamps: true });

const userSchema = new mongoose.Schema({
  name:  { type: String, required: true, trim: true, maxlength: 80 },
  email: {
    type: String, trim: true, lowercase: true, sparse: true, unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
  },
  phone: { type: String, trim: true, sparse: true, unique: true,
    match: [/^[6-9]\d{9}$/, 'Invalid Indian phone number'] },
  password: { type: String, minlength: 8, select: false },     // optional — OTP-only users won't have one
  image: { type: String, default: '' },

  role: { type: String, enum: ['user', 'admin'], default: 'user', index: true },

  emailVerified: { type: Boolean, default: false },
  phoneVerified: { type: Boolean, default: false },

  address: [addressSchema],

  refreshTokens: [{ token: String, device: String, ip: String, createdAt: { type: Date, default: Date.now } }],

  passwordChangedAt: Date,
  lastLoginAt: Date,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Either email or phone must be present
userSchema.pre('validate', function (next) {
  if (!this.email && !this.phone) this.invalidate('email', 'Either email or phone is required');
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  if (!this.isNew) this.passwordChangedAt = new Date();
  next();
});

userSchema.methods.comparePassword = function (plain) {
  if (!this.password) return false;
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.isPasswordChangedAfter = function (jwtIat) {
  if (!this.passwordChangedAt) return false;
  return jwtIat * 1000 < this.passwordChangedAt.getTime();
};

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.refreshTokens;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
