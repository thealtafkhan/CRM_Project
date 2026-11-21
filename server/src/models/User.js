const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'User name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false // Never return password hash in regular queries
  },
  role: {
    type: String,
    enum: {
      values: ['Admin', 'Manager', 'SalesExecutive'],
      message: 'Role must be Admin, Manager, or SalesExecutive'
    },
    default: 'SalesExecutive',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  failedLoginCount: {
    type: Number,
    default: 0
  },
  lockoutEnd: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Pre-save hook to hash password if modified
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Check if account is currently locked
userSchema.methods.isLocked = function() {
  return this.lockoutEnd && this.lockoutEnd > new Date();
};

module.exports = mongoose.model('User', userSchema);
