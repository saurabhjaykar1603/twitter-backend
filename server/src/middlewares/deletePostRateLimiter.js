import rateLimit from 'express-rate-limit';

// Define the rate limiting middleware
const deletePostRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 delete requests per windowMs
  message: "Too many delete requests from this IP, please try again later"
});

// Export the middleware
export { deletePostRateLimiter };
