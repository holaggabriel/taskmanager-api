const express = require('express');
const { me } = require('../controllers/user.controller');
const authenticateToken = require('../middleware/authToken');

const router = express.Router();

router.get('/me', authenticateToken, me);

module.exports = router;
