const jwt = require('jsonwebtoken');

const verifyApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    const systemApiKey = process.env.API_KEY || 'avella-dev-secret-key';

    if (!apiKey || apiKey !== systemApiKey) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Invalid or missing API Key'
        });
    }

    next();
};

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            error: 'Authentication Error',
            message: 'Access token is missing'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'avella-dev-jwt-secret');
        req.user = {
            id: decoded.userId,
            email: decoded.email,
            role: decoded.role
        };
        next();
    } catch (error) {
        return res.status(401).json({
            error: 'Authentication Error',
            message: 'Invalid or expired token'
        });
    }
};

module.exports = {
    verifyApiKey,
    verifyToken
};
