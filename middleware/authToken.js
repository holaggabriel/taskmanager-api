const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const auth_token = req.cookies.auth_token;

  if (!auth_token) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  jwt.verify(auth_token, process.env.JWT_SECRET, (err, payload) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }

    req.user = { id: payload.userId };
    next();
  });
}

module.exports = authenticateToken;
