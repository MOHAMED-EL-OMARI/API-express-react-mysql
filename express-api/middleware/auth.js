const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
    try {
        // Get token from header Authorization
        const authHeader = req.header("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Access denied, invalid token format" });
        }

        const token = authHeader.replace("Bearer ", "");
        
        if (!token) {
            return res.status(401).json({ message: "Access denied, token missing" });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
        } catch (verifyError) {
            console.error("Token verification error:", verifyError);
            return res.status(401).json({ message: "Invalid or expired token" });
        }
    } catch (error) {
        console.error("Authentication error:", error);
        res.status(500).json({ message: "Server error during authentication" });
    }
};