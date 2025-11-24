const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/letsupgrade');

const db = mongoose.connection;

db.on('connected', function () {
  console.log('Database connected successfully');
});

db.on('error', function (err) {
  console.log('Database connection error:', err);
});

module.exports = db;
