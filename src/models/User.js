const mongoose = require('mongoose');

const userSchema = {
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['LIBRARIAN', 'STUDENT'],
    default: 'STUDENT',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
};

const User = new mongoose.model('User', userSchema);

module.exports = User;
