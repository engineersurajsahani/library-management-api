const mongoose = require('mongoose');

mongoose.connect(
  'mongodb+srv://flavourstreet242_db_user:6DzL0iaN9LyXjnoO@cluster0.dqrpuqd.mongodb.net/?appName=Cluster0'
);

const db = mongoose.connection;

db.on('connected', function () {
  console.log('Database connected successfully');
});

db.on('error', function (err) {
  console.log('Database connection error:', err);
});

module.exports = db;
