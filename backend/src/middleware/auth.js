const jwt = require('jsonwebtoken');
const JWT_SECRET = 'FoodDeliveryApp';


const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: "Access denied" });

        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) return res.status(400).json({ message: "Invalid token" });
            if (!roles.includes(decoded.role)) {
                return res.status(403).json({ message: "Insufficient permissions" });
            }
            req.user = decoded;
            next();
        });
    };
};

module.exports = { authorizeRoles };
