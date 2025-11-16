import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // No token found
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Access denied! Please login first.",
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user to request object
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            message:
                error.name === "TokenExpiredError"
                    ? "Session expired. Please login again."
                    : "Invalid token. Access denied.",
        });
    }
}
