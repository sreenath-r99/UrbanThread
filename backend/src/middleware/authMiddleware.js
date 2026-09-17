import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ==========================
// USER AUTHENTICATION
// ==========================

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check whether the Authorization header exists
    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. User token not found",
      });
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.split(" ")[1];

    // Verify JWT token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    /*
      Support the possible user ID names used in the JWT.
      Your login service should preferably use userId.
    */
    const userId =
      decoded.userId ||
      decoded.id ||
      decoded._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid user token",
      });
    }

    // Find the user from the database
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account not found",
      });
    }

    // Check whether the user account is blocked
    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "This user account has been blocked",
      });
    }

    // Attach the authenticated user to the request
    req.user = user;

    // Continue to the controller
    next();
  } catch (error) {
    console.error("User authentication error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired user token",
    });
  }
};