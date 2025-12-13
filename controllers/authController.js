const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ms = require('ms');

const {
    createUser,
    findUserByEmail,
    findUserByUsername,
    findUserByIdentifier,
} = require('../models/user');

async function signup(req, res) {
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

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser(username, name, email, passwordHash);

    res.status(201).json({ success: true, message: 'Signup successful' });
}

async function signin(req, res) {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
        return res.status(400).json({ success: false, message: 'Identifier and password are required' });
    }

    const user = await findUserByIdentifier(identifier);
    if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generar token JWT
    const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Enviar token en cookie httpOnly
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

module.exports = {
    signup,
    signin,
    signout,
};
