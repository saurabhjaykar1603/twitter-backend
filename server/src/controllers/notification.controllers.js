import Notification from "../models/notification.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getallNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const notifications = await Notification.find({ to: userId })
    .populate({
      path: "from",
      select: "username profilePicture",
    })
    .sort({
      createdAt: -1,
    });
  await Notification.updateMany(
    {
      to: userId,
    },
    {
      isRead: true,
    }
  );
  return res
    .status(200)
    .json(
      new ApiResponse(200, notifications, "Notifications fetched successfully")
    );
});

export const deleteNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  await Notification.deleteMany({ to: userId });
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Notifications deleted successfully"));
});
