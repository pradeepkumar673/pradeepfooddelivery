// backend/middlewares/isAuth.js - UPDATED VERSION
import jwt from "jsonwebtoken"

const isAuth = async (req, res, next) => {
    try {
        console.log('🔍 Auth Check - Cookies:', req.cookies);
        console.log('🔍 Auth Check - Headers:', req.headers.cookie ? 'Cookie header present' : 'No cookie header');
        
        const token = req.cookies?.token;
        
        if (!token) {
            console.log('❌ No token found in cookies');
            return res.status(401).json({ 
                message: "Authentication required. Please sign in.",
                code: "NO_TOKEN"
            });
        }

        console.log('🔍 Token found, verifying...');
        
        try {
            const decodeToken = jwt.verify(token, process.env.JWT_SECRET);
            console.log('✅ Token decoded successfully:', decodeToken);
            
            if (!decodeToken.userId) {
                return res.status(401).json({ 
                    message: "Invalid token structure",
                    code: "INVALID_TOKEN"
                });
            }

            req.userId = decodeToken.userId;
            console.log(`✅ User authenticated: ${req.userId}`);
            next();
            
        } catch (jwtError) {
            console.log('❌ JWT Verification Error:', jwtError.message);
            
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({ 
                    message: "Session expired. Please sign in again.",
                    code: "TOKEN_EXPIRED"
                });
            }
            
            if (jwtError.name === 'JsonWebTokenError') {
                return res.status(401).json({ 
                    message: "Invalid authentication token.",
                    code: "INVALID_TOKEN"
                });
            }
            
            throw jwtError;
        }
        
    } catch (error) {
        console.error('❌ Auth middleware error:', error);
        return res.status(500).json({ 
            message: "Authentication server error",
            code: "AUTH_SERVER_ERROR"
        });
    }
}

export default isAuth;