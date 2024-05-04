// Import the necessary modules and utilities
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";

// authMiddleware is an asynchronous middleware function for Express applications
const authMiddleware = asyncHandler(async (req, res, next) => {
  // Retrieve the JWT token from the cookies sent with the request
  const token = req.cookies.token;
  console.log("token", token);

  // Check if the token is not present
  if (!token) {
    // If token is absent, throw an authentication error
    throw new ApiError(401, "You need to login first");
  }

  // Verify the token using the JWT_SECRET from environment variables
  // This will decode the token to retrieve the payload containing userId
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // Look up the user in the database using the userId from the token
  const user = await User.findById(decoded.userId).select("-password");

  // If user is not found, throw an authentication error
  if (!user) {
    throw new ApiError(401, "User not found");
  }

  // Attach the user object to the request object for use in subsequent middleware or route handlers
  req.user = user;

  // Call the next middleware function in the stack
  next();
});

// Export the middleware to be used in other parts of the application
export { authMiddleware };
