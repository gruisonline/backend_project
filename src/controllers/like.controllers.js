import { Like } from "../models/like.models.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import mongoose from "mongoose"

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params

  if(!videoId?.trim()) {
    throw new ApiError(400, "Video not found!")
  }

  const totalLikes = await Like.countDocuments({
    video: videoId
  })

  const existingLike = await Like.findOne({
    video: videoId,
    likedBy: req.user?._id
  })

  if (existingLike) {
      await Like.deleteOne(existingLike._id);

      return res.status(200).json(
          new ApiResponse(200, { totalLikes }, "Video unliked successfully")
      );
  }

  const likedVideo = await Like.create({
    video: videoId,
    likedBy: req.user?._id
  })

  return res.status(200).json(
    new ApiResponse(200, {totalLikes}, "Video liked successfully!")
  )
  
})

const toggleCommentLike = asyncHandler(async (req, res) => {
  
})

export {
  toggleVideoLike,
}