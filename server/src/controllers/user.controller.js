import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "./../models/user.model.js";

const getUserProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  console.log(username);
  if (!username) {
    throw new ApiError(400, "Username is required");
  }
  const user = await User.findOne({ username }).select("-password");
  if (!user) {
    throw new ApiError(404, `User not found for username : ${username}`);
  }
  res
    .status(200)
    .json(new ApiResponse(200, user, "User profile retrieved successfully"));
});

export { getUserProfile };
