const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'yoursecretkey';

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Expecting token in the format: "Bearer <token>"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('❌ No token provided or invalid format'); // Debug log
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach the decoded user object to the request
    console.log('✅ Token validated. User:', req.user); // Debug log
    next();
  } catch (err) {
    console.error('❌ Invalid or expired token:', err.message); // Debug log
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
