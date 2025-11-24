const mongoose = require('mongoose');

const bookSchema = {
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  publishedYear: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['AVAILABLE', 'NOT AVAILABLE'],
    default: 'AVAILABLE',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
};

const Book = new mongoose.model('Book', bookSchema);

module.exports = Book;
