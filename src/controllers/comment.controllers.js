import mongoose from "mongoose";
import { Comment } from "../models/comment.models.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const addComment = asyncHandler(async( req, res) => {
  const { content } = req.body
  const { videoId } = req.params

  if(!content?.trim()) {
    throw new ApiError(400, "Content field is required!")
  }

  if(!videoId?.trim()) {
    throw new ApiError(400, "Video not found!")
  }

  const comment = await Comment.create({
    content,
    video: videoId,
    owner: req.user?._id
  })

  const createdComment = await Comment.findById(comment._id)
    .populate("owner", "username fullname avatar");

  return res.status(200).json(
    new ApiResponse(201, createdComment, "Comment added successfully!")
  )

})

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  const { 
    page = 1, 
    limit = 10, 
    sortBy, 
    sortType
  } = req.query

  if(!videoId?.trim()) {
    throw new ApiError(400, "Video not found!")
  }

  const pageNumber = parseInt(page)
  const limitNumber = parseInt(limit)
  const skip = (pageNumber - 1) * limitNumber;

  const sortOptions = {
    [sortBy]: sortType === "desc" ? -1 : 1
  };

  const comments = await Comment.find({ video: videoId})
    .sort(sortOptions)
    .skip(skip)
    .limit(limitNumber)
    .populate("owner", "username avatar fullname")
    .lean();

  const totalComments = await Comment.countDocuments({ video: videoId })

  return res.status(200).json(
    new ApiResponse(
      200, 
      {
        comments,
        totalComments,
        hasMore: skip + comments.length < totalComments
      }, 
      "All comments fetched successfully!")
  )

})

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params
  const { content } = req.body

  if(!commentId?.trim()) {
    throw new ApiError(400, "comment not found!")
  }

  if(!content?.trim()) {
    throw new ApiError(400, "Content field is required!")
  }

  const updateComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content
      }
    },
    {
      new: true
    }
  )

  if(!updateComment) {
    throw new ApiError(404, "Occured error while updating comment!")
  }

  return res.status(200).json(
    new ApiResponse(200, updateComment, "Comment updated successfully!")
  )
})

const deleteComment = asyncHandler(async(req, res) => {
  const { commentId } = req.params

  if(!commentId?.trim()) {
    throw new ApiError(400, "Comment not found!")
  }

  const comment = await Comment.findByIdAndDelete(commentId)

  if(!comment) {
    throw new ApiResponse(404, "Comment not found!")
  }

  return res.status(200).json(
    new ApiResponse(200, {}, "Comment deleted successfully!")
  )

})

export {
  addComment,
  getVideoComments,
  updateComment,
  deleteComment
}