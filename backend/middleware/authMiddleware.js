import jwt from "jsonwebtoken";

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];
  const raw = authHeader && authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  if (!raw) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  const secret = process.env.JWT_SECRET || "secretKey";

  jwt.verify(raw, secret, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: "Invalid token" });
    }
    // Normalize user id onto _id so controllers can rely on it
    const uid =
      decoded?._id ||
      decoded?.id ||
      decoded?.userId ||
      decoded?.user?._id ||
      decoded?.user?.id;

    req.user = { ...decoded, _id: uid };
    next();
  });
};

export default authenticateToken;
