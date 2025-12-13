const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ms = require('ms');
const { createUser, findUserByIdentifier } = require('../models/user');

async function signup(req, res) {
  const { username, name, email, password } = req.body;

  const passwordHash = await bcrypt.hash(password, 10);
  await createUser(username, name, email, passwordHash);

  res.status(201).json({ success: true, message: 'Signup successful' });
}

async function signin(req, res) {
  const { identifier, password } = req.body;

  const user = await findUserByIdentifier(identifier);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: ms(process.env.JWT_EXPIRES_IN)
  });

  res.json({ success: true, message: 'Signin successful' });
}

function signout(req, res) {
  res.clearCookie('auth_token');
  res.json({ success: true, message: 'Signout successful' });
}

module.exports = { signup, signin, signout };
