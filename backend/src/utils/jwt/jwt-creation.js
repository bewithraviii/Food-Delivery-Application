const jwt = require('jsonwebtoken');

const JWT_SECRET = require('crypto').randomBytes(64).toString('hex');

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

module.exports = { generateToken };