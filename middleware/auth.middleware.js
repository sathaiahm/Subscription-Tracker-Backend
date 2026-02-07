import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.js';
import User from '../modules/user.model.js';

export const authorize = async (req, res, next) => {
    try {
        let token;

        // Prefer httpOnly cookie
        if (req.cookies?.token) {
            token = req.cookies.token;
        } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            // Fallback to Authorization header
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: 'Unauthorized - No token provided' 
            });
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Find user
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: 'Unauthorized - User not found' 
            });
        }

        req.user = user;
        next(); // FIXED: Added missing next() call
        
    } catch (error) {
        return res.status(401).json({ 
            success: false,
            message: "Unauthorized", 
            error: error.message 
        });
    }
};