const jwt = require('jsonwebtoken');
 
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Authorization token missing.' });
    }
    try {
       
        console.log("token validated");
        const decodedData = jwt.decode(token);
        // console.log('Decoded Token:', JSON.stringify(decodedData, null, 2));
 
        if (!decodedData) {
            return res.status(403).json({ error: 'Invalid token.' });
        }
       
        const verifiedToken = jwt.verify(token, "D0ts1t012345!");
        req.employeeId = verifiedToken._id;
        req.employeeName = verifiedToken.name;
 
        next();
    } catch (error) {
        console.error('Token validation error:', error);
        res.status(403).json({ error: 'Invalid or expired token.' });
    }
    
    
};
 
module.exports = authMiddleware;
 
