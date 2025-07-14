module.exports = function requireRole(...allowedRoles) {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied: requires role(s): ${allowedRoles.join(", ")}`,
      });
    }

    next(); // Allowed
  };
};