const jwt = require('jsonwebtoken');
const ms = require('ms');
const { User } = require('../models');

async function signup(req, res) {
  try {
    const { username, name, email, password } = req.body;

    const existingUser = await User.findByIdentifier(email) || await User.findByIdentifier(username);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username or email already exists' });
    }

    const user = await User.createUser({ username, name, email, password });

    res.status(201).json({
      success: true,
      message: 'Signup successful',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function signin(req, res) {
  try {
    const { identifier, password } = req.body;

    const user = await User.findByIdentifier(identifier);
    if (!user || !(await user.checkPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: ms(process.env.JWT_EXPIRES_IN)
    });

    res.json({ success: true, message: 'Signin successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

function signout(req, res) {
  res.clearCookie('auth_token');
  res.json({ success: true, message: 'Signout successful' });
}

module.exports = { signup, signin, signout };
