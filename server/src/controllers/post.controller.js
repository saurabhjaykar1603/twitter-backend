import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Post from "../models/post.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { v2 as cloudinary } from "cloudinary";
import User from "../models/user.model.js";

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

  // Delete the post from the database
  await Post.findByIdAndDelete(id);

  // Send a success response with no content
  return res
    .status(204)
    .json(new ApiResponse(204, null, "Post deleted successfully"));
});

export { createPost, deletePost };
