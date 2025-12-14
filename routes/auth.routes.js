const express = require('express');
const { signup, signin, signout } = require('../controllers/auth.controller');
const validateSignup = require('../middleware/validateSignup');
const validateSignin = require('../middleware/validateSignin');

const router = express.Router();

router.post('/signup', validateSignup, signup);
router.post('/signin', validateSignin, signin);
router.post('/signout', signout);

module.exports = router;
