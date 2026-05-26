import jwt from "jsonwebtoken";

/**
 * Protect routes — verify JWT from Authorization: Bearer <token>
 * On success, attaches decoded payload to req.user
 */
export const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Expect: "Bearer <token>"
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authorized — token missing",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized — token missing",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized — invalid or expired token",
    });
  }
};
