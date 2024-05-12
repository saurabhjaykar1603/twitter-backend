import Notification from "../models/notification.model.js";
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

const followUnFollowUser = asyncHandler(async (req, res) => {
  // Extract user ID from request parameters
  const { id } = req.params;

  // Check if the user ID is provided, if not, throw an error
  if (!id) {
    throw new ApiError(400, "User id is required");
  }

  // Find the user to be followed/unfollowed and the logged-in user in the database
  const userToModify = await User.findById(id);
  const loggedInUser = await User.findById(req.user._id);

  // Check if both users exist in the database
  if (!userToModify || !loggedInUser) {
    throw new ApiError(400, "One or both users not found");
  }

  // Prevent a user from following/unfollowing themselves
  if (id === req.user._id.toString()) {
    throw new ApiError(400, "You can't follow/unfollow yourself");
  }

  // Check if the logged-in user is already following the target user
  const isFollowingToTheUser = loggedInUser.following.includes(id);

  if (isFollowingToTheUser) {
    // If following, unfollow the user by removing them from the 'following' and 'followers' arrays
    await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
    await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });

    // todo return the id of the user as response
    // Return success response for unfollow
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { isfollow: false },
          "User unfollowed successfully"
        )
      );
  } else {
    // If not following, follow the user by adding them to the 'following' and 'followers' arrays
    await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
    await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
    // Send a notification to the user that is being followed
    const newNotification = new Notification({
      type: "follow",
      from: req.user._id,
      to: userToModify._id,
    });
    await newNotification.save();

    // todo return the id of the user as response

    // Return success response for follow
    return res
      .status(200)
      .json(
        new ApiResponse(200, { isfollow: true }, "User followed successfully")
      );
  }
});

export { getUserProfile, followUnFollowUser };
