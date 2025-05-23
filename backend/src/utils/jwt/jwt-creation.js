const jwt = require('jsonwebtoken');

// const JWT_SECRET = require('crypto').randomBytes(64).toString('hex');
const JWT_SECRET = 'FoodDeliveryApp';

const generateToken = (userId, userRole) => {
    return jwt.sign({ id: userId, role: userRole }, JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

module.exports = { generateToken };