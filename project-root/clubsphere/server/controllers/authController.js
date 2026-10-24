const User = require('../models/User');
const Club = require('../models/Club');
const jwt = require('jsonwebtoken');

const signup = async (req, res) => {
  const { username, password, role, club } = req.body;

  try {
    if (role !== 'STUDENT' && !club) {
      return res.status(400).json({ status: 'error', message: 'Club is required for CLUB_MEMBER or CLUB_ADMIN roles' });
    }
    if (role !== 'STUDENT') {
      const clubExists = await Club.findOne({ name: club });
      if (!clubExists) {
        return res.status(400).json({ status: 'error', message: 'Invalid club name' });
      }
    }
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ status: 'error', message: 'Username already exists' });
    }
    const user = new User({ username, password, role, club });
    await user.save();
    res.status(201).json({ status: 'success', message: 'User registered successfully' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(400).json({ status: 'error', message: error.message });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ status: 'error', message: 'Invalid username or password' });
    }
    const token = jwt.sign(
      {
        id: user._id,
        club: user.club,
        role: user.role,
        username: user.username
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.json({
      status: 'success',
      token,
      user: { username: user.username, role: user.role, club: user.club }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({ status: 'error', message: error.message });
  }
};

module.exports = { signup, login };