import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/secrets.js";

export const authenticateToken = (req, res, next) => {
  // Prefer the httpOnly cookie (not readable by JavaScript, so it can't be
  // stolen from the browser); fall back to the Authorization header for
  // backward compatibility / non-browser clients.
  const authHeader = req.headers["authorization"];
  const headerToken = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN
  const token = (req.cookies && req.cookies.token) || headerToken;

  if (!token) {
    return res.status(401).json({ success: false, message: "Access Denied" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: "Invalid Token" });
    }
    req.user = user;
    next();
  });
};

// Alias for authenticateToken
export const authenticate = authenticateToken;

// Authorize by role
export const authorize = (allowedRoles) => {
  // Handle both string and array of roles
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const userRole = req.user.role || req.user.activeRole;
    
    if (!roles.includes(userRole)) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. Required role: ${roles.join(', ')}` 
      });
    }

    next();
  };
};

