import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.models.js"
import { User } from "../models/user.models.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body

  if(!content) {
    throw new ApiError(400, "Content field is  required!")
  }

  const tweet = await Tweet.create({
    content,
    owner: req.user?._id
  })

  if(!tweet) {
    throw new ApiError(500, "Something went wrong while creating the tweet!")
  }

  const createdTweet = await Tweet.findById(tweet._id)
    .populate("owner", "avatar username fullname")

  if(!createdTweet) {
    throw new ApiError(500, "Something went wrong while creating the tweet!")
  }

  return res.status(200).json(
    new ApiResponse(200, createdTweet, "Tweet created Successfully!")
  )

})

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID!")
  }

  const user = await User.findById(userId)

  if (!user) {
      throw new ApiError(404, "User not found!")
  }

  const tweets = await Tweet.find({owner: userId})
    .populate("owner", "avatar username fullname")
    .sort({createdAt: -1})

  return res.status(200).json(
    new ApiResponse(200, tweets, "All tweets fetched successfully!")
  )
})

const updateTweet = asyncHandler(async(req, res) => {
  const { tweetId } = req.params
  const { content } = req.body

  if(!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID!")
  }

  if(!content?.trim()) {
    throw new ApiError(400, "Content field is Required!")
  }

  const updateTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      $set: {
        content
      }
    },
    {
      new: true
    }
  )

  if(!updateTweet) {
    throw new ApiError(404, "Occured error while updating Tweet!")
  }

  return res.status(200).json(
    new ApiResponse(200, updateTweet, "Tweet updated successfully!")
  )
})

const deleteTweet = asyncHandler(async(req, res) => {
  const { tweetId } = req.params

  if(!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid Tweet ID!")
  }

  const deletedTweet = await Tweet.findByIdAndDelete(tweetId)

  if(!deletedTweet) {
    throw new ApiError(400, "Something went wrong while deleting the Tweet!")
  }

  return res.status(200).json(
    new ApiResponse(200, {}, "Tweet deleted successfully!")
  )
})


export {
  createTweet,
  getUserTweets,
  updateTweet,
  deleteTweet
}