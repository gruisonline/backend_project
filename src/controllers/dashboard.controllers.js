import mongoose from "mongoose";
import { Video } from "../models/video.models.js";
import { Subscription } from "../models/subscription.models.js";
import { Like } from "../models/like.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async(req, res) => {
  const channelId = req.user?._id;

  if (!channelId) {
    throw new ApiError(401, "Unauthorized");
  }

  const videoStats = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(channelId)
      }
    }, 
    {
      $group: {
        _id: null,
        totalVideos: { $sum: 1 },
        totalViews: { $sum: "$views" }
      }
    }
  ]);

  const totalSubscribers = await Subscription.countDocuments({ channel: channelId })

  const totalLikes = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(channelId)
      }
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes"
      }
    },
    {
      $project: {
        likesCount: { $size: "$likes" }
      }
    },
    {
      $group: {
        _id: null,
        totalLikes: { $sum: "$likesCount" }
      }
    }
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
          totalVideos: videoStats[0]?.totalVideos || 0,
          totalViews: videoStats[0]?.totalViews || 0,
          totalSubscribers,
          totalLikes: totalLikes[0]?.totalLikes || 0
      },
      "Channel stats fetched successfully!"
    )
  );
})

const getChannelVideos = asyncHandler(async(req, res) => {
  const channelId = req.user?._id;

  if(!channelId) {
    throw new ApiError(401, "Unauthorized!")
  }

  const totalChannelVideo = await Video.find({owner: channelId}).sort({createdAt: -1});

  return res.status(200).json(
    new ApiResponse(
      200, 
      { totalChannelVideo },
      "All Channel videos fetched successfully!")
  )
})

export {
  getChannelStats,
  getChannelVideos
}