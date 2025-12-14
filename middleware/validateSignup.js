const { User } = require('../models');

async function validateSignup(req, res, next) {
  let { username, name, email, password } = req.body;

  // Todos los campos requeridos
  if (!username || !name || !email || !password) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  // Validación del correo
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Invalid email format' });
  }

  // Username: solo letras y números, 8-14 caracteres
  const usernameRegex = /^[a-z0-9]{8,14}$/;
  if (!usernameRegex.test(username)) {
    return res.status(400).json({
      success: false,
      message: 'Username must be 8-14 characters, lowercase letters and numbers only'
    });
  }

  // Name: solo letras y espacios, 2-30 caracteres
  const nameRegex = /^[a-zA-Z\s]{2,30}$/;
  if (!nameRegex.test(name)) {
    return res.status(400).json({ success: false, message: 'Name must be 2-30 alphabetic characters' });
  }

  // Password mínimo 8 caracteres
  if (password.length < 8) {
    return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
  }

  next();
}

module.exports = validateSignup;
