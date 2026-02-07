import aj from '../config/arject.js';

export const arcjectMiddleware = async (req, res, next) => {
    try {
        if (process.env.NODE_ENV === 'development') {
            return next();
        }

        const decision = await aj.protect(req, { requested: 1 });

        if (decision.isDenied()) {
            if (decision.reason.isRateLimit()) {
                return res.status(429).json({ 
                    success: false,
                    error: 'Rate limit exceeded' 
                });
            }
            if (decision.reason.isBot()) { // Fixed: was checking isRateLimit twice
                return res.status(403).json({ 
                    success: false,
                    error: 'Bot detected' 
                });
            }
            // Generic denial
            return res.status(403).json({ 
                success: false,
                error: 'Access denied' 
            });
        }
        
        next();
    } catch (error) {
        console.error(`Arcjet Middleware Error: ${error}`);
        // In case of Arcjet error, allow the request to proceed
        next();
    }
};