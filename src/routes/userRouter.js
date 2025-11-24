const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middlewares/authMiddleware');
require('dotenv').config();

const router = express.Router();

router.post('/register', async (request, response) => {
  try {
    const { name, username, email, password } = request.body;

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return response.status(400).json({ message: 'Username already exists' });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return response.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    response.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    response.status(500).json({ message: error.message });
  }
});

router.post('/login', async (request, response) => {
  try {
    const { username, password } = request.body;

    const user = await User.findOne({ username });
    if (!user) {
      return response.status(400).json({ message: 'Invalid username' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return response.status(400).json({ message: 'Invalid password' });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    response.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    response.status(500).json({ message: error.message });
  }
});

router.get('/profile', authMiddleware, (request, response) => {
  try {
    response.status(200).json({ user: request.user });
  } catch (error) {
    response.status(500).json({ message: error.message });
  }
});

module.exports = router;
