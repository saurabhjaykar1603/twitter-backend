import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Post from "../models/post.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { v2 as cloudinary } from "cloudinary";
import User from "../models/user.model.js";
import mongoose from "mongoose";
import Notification from "../models/notification.model.js";

// Controller function to create a new post
const createPost = asyncHandler(async (req, res) => {
  const { title } = req.body; // Destructuring title from request body
  let { image } = req.body; // Destructuring image from request body

  // Get the current logged-in user's ID from the request object
  const currentLoggedInUserId = req.user._id.toString();

  // Find the current logged-in user in the database
  const currentLoggedInUser = await User.findById(currentLoggedInUserId);

  // If the user is not found, throw an error
  if (!currentLoggedInUser) {
    throw new ApiError(400, "User not found");
  }

  // Check if both title and image are missing in the request body
  if (!title && !image) {
    throw new ApiError(400, "Please provide a title or image");
  }

  // If an image is provided, upload it to Cloudinary
  if (image) {
    try {
      const uploadedResponse = await cloudinary.uploader.upload(image);
      image = uploadedResponse.secure_url; // Update image with the URL from Cloudinary
    } catch (error) {
      throw new ApiError(500, "Image upload failed"); // Handle Cloudinary upload errors
    }
  }

  // Create a new post with the provided title, image, and user ID
  const newPost = new Post({
    title,
    image,
    user: currentLoggedInUserId,
  });

  // Save the new post to the database
  await newPost.save();

  // Send a success response with the new post data
  res
    .status(201) // HTTP status code for resource creation
    .json(new ApiResponse(201, newPost, "Post created successfully"));
});

// Controller function to delete a  post
const deletePost = asyncHandler(async (req, res) => {
  const { id } = req.params; // Extract post ID from request parameters

  // Find the post by ID in the database
  const post = await Post.findById(id);

  // If the post is not found, throw a 404 error
  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  // Check if the current logged-in user is the owner of the post
  if (post.user.toString() !== req.user._id.toString()) {
    throw new ApiError(401, null, "You are not authorized to delete the post");
  }
  if (post.image) {
    const imgageId = post.image.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(imgageId);
  }

  // Delete the post from the database
  await Post.findByIdAndDelete(id);

  // Send a success response with no content
  return res
    .status(204)
    .json(new ApiResponse(204, null, "Post deleted successfully"));
});

const commentOnPost = asyncHandler(async (req, res) => {
  // Extracting the post ID from the request parameters
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid post ID");
  }
  // Extracting the comment text from the request body
  const { text } = req.body;

  // Getting the ID of the currently logged-in user from the request object
  const loggedInUserId = req.user._id;

  // Checking if the comment text is provided in the request body
  if (!text) {
    // Throwing an error if the text field is missing
    throw new ApiError(400, "Comment text is required");
  }

  // Finding the post by ID in the database
  const post = await Post.findById(id);

  // Checking if the post exists
  if (!post) {
    // Throwing an error if the post is not found
    throw new ApiError(404, "Post not found");
  }

  // Creating a comment object with the provided text and the ID of the current user
  const newComment = {
    text,
    user: loggedInUserId,
  };

  // Adding the comment object to the comments array of the post
  post.comments.push(newComment);

  // Saving the updated post back to the database
  await post.save();

  // Returning a success response with the added comment
  return res
    .status(200)
    .json(new ApiResponse(200, newComment, "Comment added successfully"));
});

const likeUnlikePost = asyncHandler(async (req, res) => {
  // Extract the logged-in user's ID from the request object
  const loggedInUserId = req.user._id;

  // Extract the post ID from the request parameters
  const { id: postId } = req.params;

  // Check if the provided post ID is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new ApiError(400, "Invalid post ID");
  }

  // Find the post by its ID
  const post = await Post.findById(postId);
  if (!post) {
    // If the post is not found, throw a 404 error
    throw new ApiError(404, "Post not found");
  }

  // Check if the user has already liked the post
  const userLikePost = post.likes.includes(loggedInUserId);
  if (userLikePost) {
    // If the user has already liked the post, remove the like

    // Remove the user's ID from the post's likes array
    await Post.updateOne(
      { _id: postId },
      {
        $pull: { likes: loggedInUserId },
      }
    );

    // Remove the post ID from the user's likedPosts array
    await User.updateOne(
      { _id: loggedInUserId },
      {
        $pull: { likedPosts: postId },
      }
    );

    // Filter out the user's ID from the post's likes array
    const updatedLike = post.likes.filter(
      (id) => id.toString() !== loggedInUserId.toString()
    );

    // Respond with a success message and the updated likes array
    res.status(200).json(new ApiResponse(200, updatedLike, "Post unliked successfully"));
  } else {
    // If the user has not liked the post, add a like

    // Add the user's ID to the post's likes array
    post.likes.push(loggedInUserId);

    // Add the post ID to the user's likedPosts array
    await User.updateOne(
      { _id: loggedInUserId },
      {
        $push: { likedPosts: postId },
      }
    );

    // Save the updated post
    await post.save();

    // Create a notification for the like action
    const likeNotification = new Notification({
      from: loggedInUserId,
      to: post.user,
      type: "like",
    });

    // Save the notification
    await likeNotification.save();

    // Respond with a success message and the notification
    res.status(201).json(new ApiResponse(201, likeNotification, "Post liked successfully"));
  }
});


export { createPost, deletePost, commentOnPost, likeUnlikePost };
