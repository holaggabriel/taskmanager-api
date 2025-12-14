function validateSignin(req, res, next) {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ success: false, message: 'Identifier and password are required' });
  }

  next();
}

module.exports = validateSignin;
