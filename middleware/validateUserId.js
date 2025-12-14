function validateUserId(req, res, next) {
  if (!req.user?.id) {
    return res.status(400).json({ success: false, message: 'User ID missing or invalid' });
  }
  next();
}

module.exports = validateUserId;
