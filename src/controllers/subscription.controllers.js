import mongoose, {isValidObjectId} from "mongoose";
import { User } from "../models/user.models.js"
import { Subscription } from "../models/subscription.models.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const toggleSubcription = asyncHandler(async (req, res) => {
  const { channelId } = req.params

  if(!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid Channel ID!")
  }

  const channel = await User.findById(channelId);

  if (!channel) {
    throw new ApiError(404, "Channel not found");
  }

  if (req.user?._id.toString() === channelId) {
    throw new ApiError(400, "You cannot subscribe to yourself");
  }

  const existingSubscription = await Subscription.findOne({
    channel: channelId,
    subscriber: req.user?._id
  })

  if(existingSubscription) {
    await Subscription.findByIdAndDelete(existingSubscription._id)

    const subscribers = await Subscription.countDocuments({channel: channelId})

    return res.status(200).json(
      new ApiResponse(200, subscribers, "Channel unsubcribed successfully!")
    )
  }

  const subscribe = await Subscription.create({
    channel: channelId,
    subscriber: req.user?._id
  })

  if(!subscribe) {
    throw new ApiError(404, "Channel not found!")
  }

  const subscribers = await Subscription.countDocuments({channel: channelId})

  return res.status(200).json(
    new ApiResponse(200, subscribers, "Channel subscribe successfully!")
  )
})

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params

  if(!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid Channel ID!")
  }

  const channel = await User.findById(channelId);

  if (!channel) {
    throw new ApiError(404, "Channel not found");
  }

  const subscribers = await Subscription.countDocuments({channel: channelId
  })

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        subscribers
      }, 
      "Users channels subscribers fetched Succesfully!")
  )
})

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params

  if(!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Invalid Channel ID!")
  }

  const subscribedChannels = await Subscription.find({subscriber: subscriberId}).populate("channel", "username fullname avatar")

   const totalSubscribedChannels = subscribedChannels.length;

  return res.status(200).json(
    new ApiResponse(
      200, 
      {
        totalSubscribedChannels,
        subscribedChannels
      }, 
      "Users subscribed channels fetched successfully!")
  )
})

export {
  toggleSubcription,
  getUserChannelSubscribers,
  getSubscribedChannels
}