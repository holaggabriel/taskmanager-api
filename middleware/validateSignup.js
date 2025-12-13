const { findUserByEmail, findUserByUsername } = require('../models/user');

async function validateSignup(req, res, next) {
  const { username, name, email, password } = req.body;

  if (!username || !name || !email || !password) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  const emailExists = await findUserByEmail(email);
  if (emailExists) {
    return res.status(409).json({ success: false, message: 'Email already registered' });
  }

  const usernameExists = await findUserByUsername(username);
  if (usernameExists) {
    return res.status(409).json({ success: false, message: 'Username already taken' });
  }

  next(); // Si todo es correcto, continuar al controlador
}

module.exports = validateSignup;
