// PITCHPULSE/backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token and attach user ID and role to the request
const protect = (req, res, next) => {
    let token;

    // Check for Authorization header with Bearer token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];

        try {
            // Verify token using JWT_SECRET from .env
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach user information (ID and role) to req.user
            req.user = { id: decoded.id, role: decoded.role };

            return next();
        } catch (error) {
            console.error('Token verification failed:', error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        return res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};

module.exports = { protect };
