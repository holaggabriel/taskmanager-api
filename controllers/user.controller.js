const { User } = require('../models');

async function me(req, res) {
  try {
    // req.user viene de authenticateToken
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'No autenticado' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    res.json({
      success: true,
      message: "Current user data retrieved successfully",
      data: {
        user: user
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
}

module.exports = { me };
