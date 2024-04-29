import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateTokenAndSetCookie } from "../utils/genrateTokenAndSetCookie.js";
import User from "./../models/user.model.js";
import bcrypt from "bcryptjs";

const signupUser = asyncHandler(async (req, res) => {
  const { fullName, username, email, password } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!fullName || !username || !email || !password) {
    throw new ApiError(400, "Please provide all required fields");
  }
  if (!emailRegex.test(email)) {
    throw new ApiError(400, "Invalid Email Address");
  }
  const extistedUser = await User.findOne({ $or: [{ username }, { email }] });
  if (extistedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }
  //harsh password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const newUser = new User({
    fullName,
    username,
    email,
    password: hashedPassword,
  });
  // Create new user and save
  if (newUser) {
    generateTokenAndSetCookie(newUser._id, res);
    await newUser.save();

    // Convert the Mongoose document to a plain JavaScript object
    const userObject = newUser.toObject();

    // Delete the password property from the object
    delete userObject.password;

    // Send the response
    return res
      .status(201)
      .json(new ApiResponse(201, userObject, "User registered successfully"));
  } else {
    throw new ApiError(400, "Invalid user data");
  }
});

const loginUser = async (req, res) => {
  res.json({
    data: "You Hit login endpoint",
  });
};

const logoutUser = async (req, res) => {
  res.json({
    data: "You Hit logout endpoint",
  });
};

export { signupUser, loginUser, logoutUser };
