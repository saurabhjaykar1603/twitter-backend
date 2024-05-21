import Notification from "../models/notification.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "./../models/user.model.js";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

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

const fetchSuggestedUsers = asyncHandler(async (req, res) => {
  // Retrieve the ID of the current logged-in user
  const loggedInUserId = req.user._id;

  // Fetch the list of user IDs that the current user is already following
  const { following } = await User.findById(loggedInUserId).select("following");

  // Retrieve a random sample of 10 users, excluding the current logged-in user
  const randomUsers = await User.aggregate([
    {
      $match: {
        _id: { $ne: loggedInUserId },
      },
    },
    {
      $sample: { size: 10 },
    },
  ]);

  // Filter out users already followed by the logged-in user, remove passwords, limit to 4 suggestions
  const suggestedUsers = randomUsers
    .filter((user) => !following.includes(user._id)) // Filter out users already followed
    .slice(0, 4) // Limit the suggestions to 4 users
    .map((user) => {
      delete user.password; // Remove password field for security reasons
      return user;
    });

  // const suggestedUsers = randomUsers
  // .filter((user) => !following.includes(user._id)) // Filter out users already followed
  // .slice(0, 4) // Limit the suggestions to 4 users
  // .map((user) => {
  //   const { password, email, __v, ...userDetails } = user; // Destructure to omit sensitive and unnecessary data
  //   return userDetails;
  // });

  // Construct and send the response with the suggested users
  return res
    .status(200)
    .json(new ApiResponse(200, suggestedUsers, "Suggested users for you"));
});

const updateUserProfile = asyncHandler(async (req, res) => {
  // Destructure the required fields from the request body
  const {
    fullName,
    username,
    currentPassword,
    newPassword,
    email,
    bio,
    links,
    profilePicture,
    coverPicture,
  } = req.body;

  // Check if the email already exists
  if (email) {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Email already exists"));
    }
  }

  // Check if the username already exists
  if (username) {
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Username already exists"));
    }
  }

  // Get the currently logged-in user ID
  const currentLoggedInUserId = req.user._id;
  const user = await User.findById(currentLoggedInUserId);

  // Check if the user exists
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Check if both currentPassword and newPassword are provided
  if ((currentPassword && !newPassword) || (!currentPassword && newPassword)) {
    throw new ApiError(400, "Please provide both current and new password");
  }

  // If both passwords are provided, verify and update the password
  if (newPassword && currentPassword) {
    const isPasswordMatching = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordMatching) {
      throw new ApiError(400, "Current password is incorrect");
    }
    if (newPassword.length < 6) {
      throw new ApiError(400, "Password must be at least 6 characters long");
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
  }

  // Handle profile picture update
  if (profilePicture) {
    if (user.profilePicture) {
      await cloudinary.uploader.destroy(
        user.profilePicture.split("/").pop().split(".")[0]
      );
    }
    const uploadedProfilePic = await cloudinary.uploader.upload(profilePicture);
    user.profilePicture = uploadedProfilePic.secure_url;
  }

  // Handle cover picture update
  if (coverPicture) {
    if (user.coverPicture) {
      await cloudinary.uploader.destroy(
        user.coverPicture.split("/").pop().split(".")[0]
      );
    }
    const uploadedCoverPic = await cloudinary.uploader.upload(coverPicture);
    user.coverPicture = uploadedCoverPic.secure_url;
  }

  // Update user fields with provided data or retain existing values
  user.fullName = fullName || user.fullName;
  user.username = username || user.username;
  user.email = email || user.email;
  user.bio = bio || user.bio;
  user.links = links || user.links;

  // Save the updated user
  const updatedUser = await user.save();
  updatedUser.password = null; // Remove password from the response

  // Return the updated user data
  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "User updated successfully"));
});

export {
  getUserProfile,
  followUnFollowUser,
  fetchSuggestedUsers,
  updateUserProfile,
};
