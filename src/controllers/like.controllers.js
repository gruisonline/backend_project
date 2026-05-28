import { Like } from "../models/like.models.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { isValidObjectId } from "mongoose"

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params

  if(!videoId?.trim()) {
    throw new ApiError(400, "Video not found!")
  }

  const existingLike = await Like.findOne({
    video: videoId,
    likedBy: req.user?._id
  })

  if (existingLike) {
      await Like.deleteOne(existingLike._id);

      const totalLikes = await Like.countDocuments({
        video: videoId
      })

      return res.status(200).json(
          new ApiResponse(200, { totalLikes }, "Video unliked successfully")
      );
  }

  const likedVideo = await Like.create({
    video: videoId,
    likedBy: req.user?._id
  })

  const totalLikes = await Like.countDocuments({
    video: videoId
  })

  return res.status(200).json(
    new ApiResponse(200, {totalLikes}, "Video liked successfully!")
  )
  
})

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params

  if(!commentId?.trim()) {
    throw new ApiError(400, "Commnet not found!")
  }

  const totalLikes = await Like.countDocuments({video: videoId})

  const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: req.user?._id
  })

  if(existingLike) {
    await Like.deleteOne(existingLike._id)

    return res.status(200).json(
      new ApiResponse(200, {totalLikes}, "Comment disliked successfully!")
    )
  }

  const likedComment = await Like.create({
    comment: commentId,
    likedBy: req.user?._id
  })

  if(!likedComment) {
    throw new ApiError(404, "Something went wrong while liking Comment!")
  }

  return res.status(200).json(
    new ApiResponse(200, {totalLikes}, "Comment liked successfully!")
  )
})

const toggleTweetlike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params

  if(!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID!")
  }

  const tweetLikes = await Like.countDocuments({tweet: tweetId})

  const existingLike = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user?._id
  })

  if(existingLike) {
    await Like.deleteOne(existingLike._id)

    return res.status(200).json(
      new ApiResponse(200, tweetLikes, "Tweet unliked successfully!")
    )
  }

  const likedTweet = await Like.create({
    tweet: tweetId,
    likedBy: req.user?._id
  })

  if(!likedTweet) {
    throw new ApiError(404, "Something went wrong while liking tweet!")
  }

  return res.status(200).json(
    new ApiResponse(200, tweetLikes, "Tweet liked successfully!")
  )
})

const getLikedVideos = asyncHandler(async(req, res) => {
  const userId = req.user?._id
  const { 
    page = 1, 
    limit = 10, 
    sortBy, 
    sortType
  } = req.query

  const pageNumber = parseInt(page)
  const limitNumber = parseInt(limit)
  const skip = (pageNumber - 1) * limitNumber;

  if(!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID!")
  }
  const likedVideos = await Like.find({ likedBy: userId})
    .skip(skip)
    .limit(limitNumber)
    .populate([
      {
        path: "likedBy",
        select: "fullname",
      },
      {
        path: "video",
        select: "title thumbnail.url description duration views videoFile.url",
      },
    ])
    .lean();

  const totalLikedVideos = await Like.countDocuments({ likedBy: userId })
  
  return res.status(200).json(
    new ApiResponse(
      200, 
      {
        likedVideos,
        totalLikedVideos,
        hasMore: skip + likedVideos.length < totalLikedVideos
      }, 
      "All liked videos fetched successfully!")
  )
})

export {
  toggleVideoLike,
  toggleCommentLike,
  toggleTweetlike,
  getLikedVideos
}