// Importing the jwt module to use its functionalities for generating tokens.
import jwt from "jsonwebtoken";

// Define the function that generates a JWT and sets it as a cookie.
const generateTokenAndSetCookie = (userId, res) => {
  // Generate a JWT using the user's ID. The token will be signed with a secret key stored in environment variables.
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "15d", // The token expires in 15 days.
  });

  // Set the generated token as a cookie in the user's browser.
  res.cookie("token", token, {
    maxAge: 15 * 24 * 60 * 60 * 1000, // The cookie expires in 15 days, specified in milliseconds.
    httpOnly: true, // The cookie cannot be accessed by client-side JavaScript. This reduces XSS risks.
    secure: true, // The cookie is only sent over HTTPS, which is secure.
    sameSite: "strict", // The cookie is not sent with cross-site requests, which helps mitigate CSRF attacks.
  });
};

// Export the function to be used in other parts of the application.
export { generateTokenAndSetCookie };
