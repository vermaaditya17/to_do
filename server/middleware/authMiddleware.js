import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      // सीक्रेट की का फॉलबैक (जो हमने authRoutes में लगाया था)
      const secret = process.env.JWT_SECRET || 'fallback_jwt_secret_key_54321';
      
      // 1. टोकन वेरीफाई करें
      const decoded = jwt.verify(token, secret);
      console.log("\n🔑 [MIDDLEWARE DEBUG] Token decoded successfully. Payload ID:", decoded.id);

      // 2. डेटाबेस से यूजर ढूंढें
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        console.log(`❌ [MIDDLEWARE DEBUG] User ID ${decoded.id} found in token, but DOES NOT exist in MongoDB database.`);
        return res.status(401).json({ message: 'User no longer exists in database. Please re-register.' });
      }

      console.log("✅ [MIDDLEWARE DEBUG] req.user successfully attached:", req.user._id);
      return next();

    } catch (error) {
      console.error('❌ [MIDDLEWARE DEBUG] Token verification failed:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    console.log('❌ [MIDDLEWARE DEBUG] No token found in Authorization header');
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export default protect;