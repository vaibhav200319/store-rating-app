/**
 * Restrict access to specific roles (authorization layer).
 * Must run AFTER protect middleware so req.user exists.
 *
 * @param  {...string} allowedRoles - e.g. authorizeRoles("ADMIN") or authorizeRoles("ADMIN", "OWNER")
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user?.role) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden — insufficient permissions",
      });
    }

    next();
  };
};
