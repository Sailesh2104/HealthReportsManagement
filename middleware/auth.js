const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        console.log('=== Auth Middleware ===');
        console.log('Request headers:', req.headers);
        
        const token = req.header('Authorization')?.replace('Bearer ', '');
        console.log('Extracted token:', token ? 'Present' : 'Missing');
        
        if (!token) {
            console.log('No token provided');
            throw new Error('No token provided');
        }

        console.log('Verifying token...');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        console.log('Decoded token:', decoded);

        console.log('Finding user...');
        const user = await User.findByPk(decoded.userId);
        console.log('Found user:', user ? {
            id: user.id,
            username: user.username,
            userType: user.userType
        } : 'Not found');

        if (!user) {
            console.log('User not found');
            throw new Error('User not found');
        }

        req.user = user;
        req.token = token;
        console.log('Auth middleware completed successfully');
        console.log('=====================');
        next();
    } catch (error) {
        console.error('=== Auth Middleware Error ===');
        console.error('Error details:', error);
        console.error('Stack trace:', error.stack);
        console.error('=====================');
        res.status(401).json({ error: 'Please authenticate.' });
    }
};

const checkUserType = (userType) => {
    return (req, res, next) => {
        console.log('=== Check User Type ===');
        console.log('Required user type:', userType);
        console.log('Current user type:', req.user.userType);
        
        if (req.user.userType !== userType) {
            console.log('Access denied - wrong user type');
            console.log('=====================');
            return res.status(403).json({ error: 'Access denied.' });
        }
        
        console.log('User type check passed');
        console.log('=====================');
        next();
    };
};

module.exports = { auth, checkUserType }; 