// API Key Authentication Middleware
// Checks for x-api-key header against API_KEY in .env

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

module.exports = {
    verifyApiKey
};
